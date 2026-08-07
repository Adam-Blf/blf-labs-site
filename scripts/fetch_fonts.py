"""Rapatrie les polices du site en local, dans public/fonts.

Pourquoi ce script existe : regle d'assets locaux d'Adam - aucune app livree ne
depend d'un CDN (Google Fonts inclus). Les postes hospitaliers et les
environnements isoles n'ont pas internet, et un flux sortant vers un CDN est
refuse par les DSI. Le script est versionne pour que n'importe qui puisse
reconstruire public/fonts sans poser de question.

Usage : python scripts/fetch_fonts.py
"""

from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

# UA moderne obligatoire : sans lui, Google Fonts sert du TTF au lieu du woff2.
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

#
# Choix typographique (revise le 2026-08-07) :
# Space Grotesk et Space Mono ont ete abandonnees. Leur chiffre zero porte un
# point central, detail qui les rend immediatement reconnaissables et donne au
# site l'air d'un gabarit genere. Remplacees par une paire au dessin plus
# ordinaire sur les chiffres, mais plus caracterisee sur les lettres.
#
FONTS: dict[str, str] = {
    # Outfit, variable 300 -> 900. Police unique du site, titres et texte.
    # Rapatriee en local : la specification l'appelait depuis Google Fonts, ce
    # qui ferait partir une requete vers un tiers a chaque chargement de page.
    "outfit": (
        "https://fonts.googleapis.com/css2"
        "?family=Outfit:wght@300..900&display=swap"
    ),
}

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "fonts"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    written: list[str] = []

    for slug, css_url in FONTS.items():
        css = fetch(css_url).decode("utf-8")
        # On ne garde que le sous-ensemble latin : le reste (cyrillique, grec)
        # alourdit sans servir un site 100% francais. Le nom de fichier porte le
        # poids et le sous-ensemble, sinon le mapping vers next/font/local se
        # fait a l'aveugle.
        blocks = re.findall(r"/\*\s*([\w\-\[\]]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)
        seen: set[str] = set()
        # Site 100% francais : le sous-ensemble "latin" de Google couvre tous les
        # accents francais, la cedille et la ligature oe. On n'embarque pas
        # latin-ext, ce serait du poids mort.
        for subset, body in blocks:
            if subset != "latin":
                continue
            found = re.search(r"url\((https://[^)]+\.woff2)\)", body)
            if not found:
                continue
            weight = re.search(r"font-weight:\s*([\d\s]+);", body)
            # "400 800" pour une variable, "400" pour une statique.
            weight_slug = weight.group(1).strip().replace(" ", "-") if weight else "400"
            name = f"{slug}-{weight_slug}-{subset}.woff2"
            if name in seen:
                continue
            seen.add(name)
            target = OUT_DIR / name
            target.write_bytes(fetch(found.group(1)))
            written.append(f"{name} ({target.stat().st_size // 1024} Ko)")

        if not seen:
            print(f"ECHEC : aucune source woff2 latine pour {slug}", file=sys.stderr)
            return 1

    print("Polices ecrites dans public/fonts :")
    for line in written:
        print(f"  - {line}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
