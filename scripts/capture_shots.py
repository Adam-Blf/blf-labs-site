"""Capture les realisations en ligne et ecrit les vignettes du site.

Pourquoi ce script existe : les captures affichees sur la page d'accueil
montraient l'etat brut du premier chargement, c'est a dire l'ecran d'accueil
de l'onboarding de Bacchana et le bandeau cookies par dessus. Une vitrine qui
montre un bandeau de consentement au lieu du produit ne prouve rien. Le script
rejoue donc le parcours d'un visiteur avant de declencher la capture : passer
le guide d'introduction, refuser les traceurs, laisser l'interface se poser.

Le refus des traceurs est deliberé : c'est le choix le plus sobre, il evite
d'envoyer une visite artificielle dans la mesure d'audience du produit, et il
garantit que la capture ne depend pas d'un script tiers charge apres coup.

Sortie : public/shots/<slug>.webp, dimensionne pour la carte de realisation et
converti pour ne pas faire payer la page d'accueil au visiteur mobile.

Prerequis : python -m pip install playwright Pillow && python -m playwright
install chromium

Usage : python scripts/capture_shots.py [slug ...]
        sans argument, toutes les realisations sont recapturees.
"""

from __future__ import annotations

import socket
import sys
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlparse

try:
    from PIL import Image
except ImportError:
    sys.exit(
        "Pillow est requis pour la conversion WebP. Installer avec :\n"
        "  python -m pip install Pillow"
    )

try:
    from playwright.sync_api import Error as PlaywrightError
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit(
        "Playwright est requis pour la capture. Installer avec :\n"
        "  python -m pip install playwright && python -m playwright install chromium"
    )

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "shots"

# Fenetre de capture. Le rapport 16/10 cadre la carte de realisation sans bande
# vide, et l'echelle 2 rend le texte net sur ecran a haute densite.
VIEWPORT = {"width": 1440, "height": 900}
SCALE = 2

# Largeur d'affichage maximale de la carte, doublee pour la haute densite.
TARGET_WIDTH = 1200


@dataclass
class Shot:
    """Une realisation a capturer.

    `dismiss` liste des libelles de boutons a cliquer avant la capture, dans
    l'ordre. Un libelle absent n'est pas une erreur : l'onboarding ne s'affiche
    qu'a la premiere visite, et le contexte de navigation est neuf a chaque run,
    mais l'interface peut evoluer sans que la capture ait a echouer pour autant.
    """

    slug: str
    url: str
    dismiss: list[str] = field(default_factory=list)
    settle_ms: int = 4000


SHOTS = [
    Shot(
        slug="bacchana",
        url="https://bacchana.beloucif.com",
        # "Passer" saute le carrousel d'introduction, "Tout refuser" ecarte le
        # bandeau cookies. Sans ces deux clics, la capture ne montre que le
        # guide de bienvenue et le consentement, jamais le produit.
        dismiss=["Passer", "Tout refuser"],
    ),
    Shot(
        slug="ohypnozen",
        url="https://ohypnozen.com",
        # Le site ouvre sur une visite guidee modale qui floute toute la page
        # derriere elle. "Ignorer le guide" la ferme ; sans ce clic, la vitrine
        # du studio affiche un fond flou et une bulle de bienvenue.
        dismiss=["Ignorer le guide", "Tout refuser"],
    ),
]


def ipv4_resolver_rules(shots: list[Shot]) -> list[str]:
    """Impose a Chromium la resolution IPv4 reelle des domaines a capturer.

    Pourquoi : certains acces (dont la connexion depuis laquelle ce script a ete
    ecrit) font du DNS64/NAT64. Un domaine qui n'a qu'un enregistrement A, comme
    l'apex ohypnozen.com, se voit alors repondre une adresse IPv6 synthetisee du
    prefixe 64:ff9b::/96 que la passerelle ne route pas : le navigateur attend
    puis abandonne, alors que le site repond parfaitement en IPv4. Sans cette
    regle, la capture echoue sur le reseau et non sur le site.

    L'adresse est resolue a chaque execution, jamais figee dans le fichier : si
    l'hebergeur change d'IP, le script suit. Un domaine qui ne resout pas du tout
    est laisse tel quel, pour que l'echec soit visible au chargement plutot que
    masque ici.
    """
    rules = []
    for host in sorted({urlparse(shot.url).hostname for shot in shots if shot.url}):
        try:
            infos = socket.getaddrinfo(host, 443, socket.AF_INET, socket.SOCK_STREAM)
        except OSError:
            continue
        rules.append(f"MAP {host} {infos[0][4][0]}")
    return rules


def capture(page, shot: Shot, raw_path: Path) -> None:
    # "load" et non "networkidle" : les deux sites gardent des connexions
    # ouvertes (mesure d'audience, rafraichissement), l'inactivite reseau
    # n'arrive donc jamais et l'attente expirerait a coup sur.
    page.goto(shot.url, wait_until="load", timeout=60_000)
    page.wait_for_timeout(2_000)

    for label in shot.dismiss:
        # Les deux sites melangent boutons et liens pour ces raccourcis, d'ou
        # l'essai des deux roles avant de tomber sur le simple texte.
        candidates = [
            page.get_by_role("button", name=label, exact=False).first,
            page.get_by_role("link", name=label, exact=False).first,
            page.get_by_text(label, exact=False).first,
        ]
        for candidate in candidates:
            try:
                candidate.click(timeout=3_000)
                page.wait_for_timeout(1_200)
                break
            except PlaywrightError:
                continue
        else:
            print(f"  note : \"{label}\" introuvable, capture sans ce clic")

    page.wait_for_timeout(shot.settle_ms)
    page.screenshot(path=str(raw_path))


def to_webp(raw_path: Path, target: Path) -> str:
    image = Image.open(raw_path).convert("RGB")

    if image.width > TARGET_WIDTH:
        height = round(image.height * TARGET_WIDTH / image.width)
        image = image.resize((TARGET_WIDTH, height), Image.LANCZOS)

    image.save(target, "WEBP", quality=82, method=6)
    return f"{target.stat().st_size // 1024} Ko ({image.width}x{image.height})"


def main(argv: list[str]) -> int:
    wanted = set(argv[1:])
    todo = [s for s in SHOTS if not wanted or s.slug in wanted]

    unknown = wanted - {s.slug for s in SHOTS}
    if unknown:
        sys.exit(f"Realisation inconnue : {', '.join(sorted(unknown))}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    raw_dir = ROOT / "screenshots"
    raw_dir.mkdir(exist_ok=True)

    failed: list[str] = []

    rules = ipv4_resolver_rules(todo)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            args=[f"--host-resolver-rules={','.join(rules)}"] if rules else [],
        )
        for shot in todo:
            print(f"{shot.slug} : {shot.url}")
            raw_path = raw_dir / f"shot-{shot.slug}.png"
            page = browser.new_page(
                viewport=VIEWPORT,
                device_scale_factor=SCALE,
                locale="fr-FR",
            )
            try:
                capture(page, shot, raw_path)
            except PlaywrightError as error:
                # Un site injoignable n'est pas une raison d'abandonner les
                # autres captures, et surtout pas d'ecraser la vignette
                # existante par une page d'erreur.
                first_line = str(error).splitlines()[0]
                print(f"  ECHEC : {first_line}")
                failed.append(shot.slug)
                continue
            finally:
                page.close()

            print(f"  {shot.slug}.webp : {to_webp(raw_path, OUT_DIR / f'{shot.slug}.webp')}")
        browser.close()

    if failed:
        print(
            f"\n{len(failed)} capture(s) non produite(s) : {', '.join(failed)}."
            "\nLa vignette precedente est conservee : verifier que le site est"
            " bien en ligne avant de relancer."
        )
        return 1

    print(f"\n{len(todo)} capture(s) ecrite(s) dans public/shots")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
