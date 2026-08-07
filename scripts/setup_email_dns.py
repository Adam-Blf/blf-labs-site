"""Configure l'envoi d'emails : lit les enregistrements exiges par Resend et les
pose dans la zone DNS OVH de beloucif.com, puis declenche la verification.

Pourquoi un script plutot qu'un copier-coller dans l'interface OVH : une cle
DKIM fait plus de 200 caracteres, une faute de frappe ne se voit pas et ne se
manifeste que par des emails qui n'arrivent jamais. Ici, la valeur va de l'API
Resend a l'API OVH sans passer par un clavier.

Ce script est IDEMPOTENT : un enregistrement deja present avec la bonne valeur
est laisse tel quel, un enregistrement present avec une mauvaise valeur est
corrige. On peut donc le relancer autant de fois que necessaire.

GARDE-FOU : le script refuse de toucher aux enregistrements MX de la racine.
Ce sont eux qui font fonctionner adam@beloucif.com ; les ecraser couperait la
messagerie. Resend n'en demande que si la reception est activee, ce qu'on ne
veut pas ici.

SECRETS : les identifiants sont lus dans un fichier d'environnement hors depot
et ne sont jamais affiches.

Usage :
  python scripts/setup_email_dns.py            # montre ce qui serait fait
  python scripts/setup_email_dns.py --apply    # ecrit dans la zone DNS
  python scripts/setup_email_dns.py --verify   # demande la verification a Resend
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ovh_dns import ZONE, call, load_credentials, resolve_env_file  # noqa: E402

RESEND_API = "https://api.resend.com"


def load_resend_key(env_file: Path) -> str:
    for raw in env_file.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if line.startswith("RESEND_API_KEY=") and "=" in line:
            value = line.partition("=")[2].strip().strip('"').strip("'")
            if value:
                return value
    sys.exit("RESEND_API_KEY absente ou vide dans le fichier d'environnement")


def resend(key: str, method: str, path: str):
    request = urllib.request.Request(
        f"{RESEND_API}{path}",
        method=method,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            # Sans User-Agent, Cloudflare rejette l'appel en 403 code 1010
            # avant meme qu'il atteigne l'API Resend.
            "User-Agent": "blf-labs-site/1.0 (+https://beloucif.com)",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else None
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        sys.exit(f"Resend a refuse {method} {path} ({error.code}) : {detail}")


def find_domain(key: str, name: str) -> dict:
    payload = resend(key, "GET", "/domains")
    for domain in payload.get("data", []):
        if domain.get("name") == name:
            return domain
    sys.exit(
        f"Domaine {name} introuvable chez Resend. Ajoutez-le d'abord sur "
        "https://resend.com/domains"
    )


def to_subdomain(record_name: str) -> str:
    """Convertit un nom absolu Resend en sous-domaine relatif attendu par OVH."""
    name = record_name.rstrip(".")
    if name == ZONE:
        return ""
    if name.endswith(f".{ZONE}"):
        return name[: -len(f".{ZONE}")]
    return name


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="ecrit dans la zone")
    parser.add_argument("--verify", action="store_true", help="declenche la verification")
    parser.add_argument("--env-file", type=Path, default=None)
    args = parser.parse_args()

    env_file = resolve_env_file(args.env_file)
    key = load_resend_key(env_file)
    creds = load_credentials(env_file)

    domain = find_domain(key, ZONE)
    detail = resend(key, "GET", f"/domains/{domain['id']}")
    records = detail.get("records", [])

    print(f"Domaine {ZONE} chez Resend : statut {detail.get('status')}, "
          f"region {detail.get('region')}, {len(records)} enregistrement(s) requis\n")

    # Etat courant de la zone, pour l'idempotence.
    existing_ids = call(creds, "GET", f"/domain/zone/{ZONE}/record")
    existing = [call(creds, "GET", f"/domain/zone/{ZONE}/record/{i}") for i in existing_ids]

    changed = False

    for record in records:
        rtype = record["type"]
        sub = to_subdomain(record["name"])
        value = record["value"]
        priority = record.get("priority")

        # Garde-fou : jamais de MX a la racine, c'est la messagerie d'Adam.
        if rtype == "MX" and sub == "":
            print("IGNORE : MX sur la racine (protegerait la messagerie existante)")
            continue

        match = next(
            (r for r in existing if r["fieldType"] == rtype and (r["subDomain"] or "") == sub),
            None,
        )

        label = f"{rtype:5} {sub or '@':22}"

        # Cible telle qu'OVH la stocke reellement. Pour un MX, OVH prefixe la
        # priorite dans la cible ("10 mx.example.com") alors que Resend la
        # renvoie dans un champ separe : comparer les deux sans cette mise en
        # forme faisait croire a une difference a chaque execution, et le script
        # supprimait puis recreait l'enregistrement sans raison.
        expected = f"{priority} {value}" if priority is not None else value

        if match and match["target"].strip('"') == expected.strip('"'):
            print(f"OK      {label} deja correct")
            continue

        if match:
            print(f"CORRIGE {label} valeur differente (id {match['id']})")
            if args.apply:
                call(creds, "DELETE", f"/domain/zone/{ZONE}/record/{match['id']}")
        else:
            print(f"AJOUTE  {label} -> {value[:60]}{'...' if len(value) > 60 else ''}")

        if args.apply:
            # OVH attend la priorite prefixee dans la cible pour un MX.
            call(
                creds,
                "POST",
                f"/domain/zone/{ZONE}/record",
                {"fieldType": rtype, "subDomain": sub, "target": expected, "ttl": 0},
            )
            changed = True

    if args.apply and changed:
        call(creds, "POST", f"/domain/zone/{ZONE}/refresh")
        print("\nZone OVH rechargee.")
    elif not args.apply:
        print("\nSimulation seulement. Relancez avec --apply pour ecrire.")

    if args.verify:
        resend(key, "POST", f"/domains/{domain['id']}/verify")
        print("Verification demandee a Resend. La propagation DNS prend "
              "generalement quelques minutes.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
