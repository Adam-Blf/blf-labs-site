"""Cree, chez Resend, le webhook qui alimente la liste de suppression.

POURQUOI CE WEBHOOK N'EST PAS UN CONFORT.

Sans lui, le back-office affiche « envoye » pour l'eternite, y compris pour une
adresse qui n'existe plus et pour quelqu'un qui a clique sur « indesirable ». Or
ce sont exactement les deux evenements qui comptent :

  - une plainte est une opposition. La personne doit sortir de la liste sur le
    champ, sans attendre qu'elle trouve le lien de desinscription ;
  - continuer a solliciter une adresse morte est le signal numero un qui fait
    basculer un domaine en indesirable, et il emporte avec lui les factures et
    les accuses de reception qui partent du meme domaine.

POURQUOI UN SCRIPT PLUTOT QUE TROIS CLICS DANS L'INTERFACE. Le secret de
signature ne s'affiche qu'une fois. Recopie a la main, il finit dans un
presse-papier, puis dans un fichier temporaire, puis nulle part. Ici il va de
l'API a un fichier que l'appelant designe, et il n'est jamais affiche.

IDEMPOTENT : si un webhook pointe deja vers la meme adresse, le script ne cree
rien et le dit. Resend ne reaffiche pas le secret d'un webhook existant ; il
faut alors le supprimer et le recreer, ce que ce script ne fait pas tout seul.

Usage :
  python scripts/setup_resend_webhook.py                      # montre l'etat
  python scripts/setup_resend_webhook.py --apply --sortie F   # cree, secret dans F
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ovh_dns import resolve_env_file  # noqa: E402
from setup_email_dns import load_resend_key  # noqa: E402

ENDPOINT = "https://beloucif.com/api/resend/webhook"

# Les cinq evenements que le code sait traiter, et aucun de plus. S'abonner a
# tout remplirait la table d'evenements dont personne ne fait rien.
EVENEMENTS = [
    "email.delivered",
    "email.opened",
    "email.clicked",
    "email.bounced",
    "email.complained",
]


def appel(cle: str, methode: str, chemin: str, corps: dict | None = None):
    requete = urllib.request.Request(
        f"https://api.resend.com{chemin}",
        method=methode,
        data=json.dumps(corps).encode() if corps else None,
        headers={
            "Authorization": f"Bearer {cle}",
            "Content-Type": "application/json",
            # Sans User-Agent, Cloudflare refuse l'appel en 403 code 1010.
            "User-Agent": "blf-labs-site/setup-resend-webhook",
        },
    )
    try:
        with urllib.request.urlopen(requete, timeout=30) as reponse:
            return json.loads(reponse.read() or b"{}")
    except urllib.error.HTTPError as erreur:
        # Le corps d'erreur de Resend ne contient pas la cle, mais on tronque
        # par principe : une trace d'erreur est le premier endroit ou un secret
        # finit par apparaitre.
        sys.exit(f"{methode} {chemin} -> {erreur.code} {erreur.read().decode()[:200]}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="creer le webhook")
    parser.add_argument(
        "--sortie",
        type=Path,
        default=None,
        help="fichier ou ecrire le secret de signature, hors depot",
    )
    parser.add_argument("--env-file", type=Path, default=None)
    args = parser.parse_args()

    cle = load_resend_key(resolve_env_file(args.env_file))

    existants = appel(cle, "GET", "/webhooks").get("data", [])
    print(f"{len(existants)} webhook(s) chez Resend")
    for w in existants:
        print(f"  {w.get('status'):9} {w.get('endpoint')}")
        if w.get("endpoint") == ENDPOINT:
            print("\nLe webhook existe deja, rien a faire.")
            print("Resend ne reaffiche jamais le secret d'un webhook existant :")
            print("le retrouver dans Vercel, ou supprimer puis recreer.")
            return 0

    print(f"\n  a creer : {ENDPOINT}")
    for evenement in EVENEMENTS:
        print(f"    {evenement}")

    if not args.apply:
        print("\nSimulation. Relancer avec --apply et --sortie pour creer.")
        return 0

    if args.sortie is None:
        sys.exit("--sortie est obligatoire avec --apply : le secret ne s'affiche pas.")

    cree = appel(cle, "POST", "/webhooks", {"endpoint": ENDPOINT, "events": EVENEMENTS})
    secret = cree.get("signing_secret")
    if not secret:
        sys.exit("Resend n'a pas rendu de secret de signature.")

    args.sortie.write_text(secret, encoding="utf-8")
    print(f"\nWebhook cree, identifiant {cree.get('id')}")
    print(f"Secret de signature ecrit dans {args.sortie}, {len(secret)} caracteres.")
    print("A poser dans RESEND_WEBHOOK_SECRET, puis SUPPRIMER ce fichier.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
