"""Pilote la zone DNS OVH de beloucif.com.

Pourquoi : le site doit vivre sur l'apex beloucif.com et les emails de commande
partent par Resend, ce qui demande des enregistrements DNS. Les poser a la main
dans l'interface OVH est une source d'erreur silencieuse (une faute de frappe
dans un DKIM ne se voit qu'a l'email qui n'arrive jamais).

SECRETS : les identifiants OVH ne sont JAMAIS dans ce fichier ni dans le depot.
Ils sont lus dans un fichier d'environnement externe, hors du repo, et ce script
n'imprime jamais une valeur de cle - uniquement les noms de variables manquantes.

Usage :
  python scripts/ovh_dns.py list [--filter TXT]
  python scripts/ovh_dns.py add --type CNAME --sub www --target cname.vercel-dns.com.
  python scripts/ovh_dns.py delete --id 123456789
  python scripts/ovh_dns.py refresh

Le fichier d'environnement est cherche dans cet ordre, premier existant retenu :
  1. l'option --env-file
  2. la variable d'environnement OVH_ENV_FILE
  3. C:/Users/adamb/Desktop/.env          (fichier dedie Icons8 + OVH)
  4. C:/Users/adamb/Desktop/bacchana.env  (repli historique)
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ENV_CANDIDATES = (
    Path("C:/Users/adamb/Desktop/.env"),
    Path("C:/Users/adamb/Desktop/bacchana.env"),
)
ZONE = "beloucif.com"


def resolve_env_file(explicit: Path | None) -> Path:
    """Premier fichier d'environnement existant, sans jamais lire son contenu."""
    if explicit:
        return explicit
    override = os.environ.get("OVH_ENV_FILE")
    if override:
        return Path(override)
    for candidate in ENV_CANDIDATES:
        if candidate.exists():
            return candidate
    sys.exit(
        "Aucun fichier d'environnement trouve. Emplacements essayes : "
        + ", ".join(str(path) for path in ENV_CANDIDATES)
    )
REQUIRED = ("OVH_APPLICATION_KEY", "OVH_APPLICATION_SECRET", "OVH_CONSUMER_KEY")

ENDPOINTS = {
    "ovh-eu": "https://eu.api.ovh.com/1.0",
    "ovh-ca": "https://ca.api.ovh.com/1.0",
    "ovh-us": "https://api.us.ovhcloud.com/1.0",
}


def load_credentials(env_file: Path) -> dict[str, str]:
    """Lit uniquement les cles OVH du fichier, et rien d'autre."""
    if not env_file.exists():
        sys.exit(f"Fichier d'environnement introuvable : {env_file}")

    values: dict[str, str] = {}
    for raw in env_file.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if not key.startswith("OVH_"):
            continue  # On ignore delibererement tout le reste du fichier.
        values[key] = value.strip().strip('"').strip("'")

    missing = [key for key in REQUIRED if not values.get(key)]
    if missing:
        sys.exit("Cles OVH manquantes dans le fichier : " + ", ".join(missing))

    endpoint = values.get("OVH_ENDPOINT", "ovh-eu")
    values["_base"] = ENDPOINTS.get(endpoint, ENDPOINTS["ovh-eu"])
    return values


def call(creds: dict[str, str], method: str, path: str, body: dict | None = None):
    """Appel signe de l'API OVH (signature SHA1 documentee par OVH)."""
    url = f"{creds['_base']}{path}"
    payload = json.dumps(body) if body is not None else ""
    timestamp = str(int(time.time()))

    raw = "+".join(
        [
            creds["OVH_APPLICATION_SECRET"],
            creds["OVH_CONSUMER_KEY"],
            method,
            url,
            payload,
            timestamp,
        ]
    )
    signature = "$1$" + hashlib.sha1(raw.encode("utf-8")).hexdigest()

    request = urllib.request.Request(
        url,
        data=payload.encode("utf-8") if payload else None,
        method=method,
        headers={
            "X-Ovh-Application": creds["OVH_APPLICATION_KEY"],
            "X-Ovh-Consumer": creds["OVH_CONSUMER_KEY"],
            "X-Ovh-Timestamp": timestamp,
            "X-Ovh-Signature": signature,
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            text = response.read().decode("utf-8")
            return json.loads(text) if text else None
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        # On remonte le message d'OVH tel quel : il ne contient pas de secret.
        sys.exit(f"OVH a refuse {method} {path} ({error.code}) : {detail}")


def cmd_list(creds, args) -> None:
    params = f"?fieldType={args.filter}" if args.filter else ""
    ids = call(creds, "GET", f"/domain/zone/{ZONE}/record{params}")
    print(f"{len(ids)} enregistrement(s) dans la zone {ZONE}\n")
    print(f"{'ID':<12} {'TYPE':<8} {'SOUS-DOMAINE':<24} CIBLE")
    for record_id in ids:
        record = call(creds, "GET", f"/domain/zone/{ZONE}/record/{record_id}")
        sub = record.get("subDomain") or "@"
        print(
            f"{record['id']:<12} {record['fieldType']:<8} {sub:<24} {record['target']}"
        )


def cmd_add(creds, args) -> None:
    created = call(
        creds,
        "POST",
        f"/domain/zone/{ZONE}/record",
        {
            "fieldType": args.type,
            "subDomain": args.sub,
            "target": args.target,
            "ttl": args.ttl,
        },
    )
    print(f"Cree : id={created['id']} {args.type} {args.sub or '@'} -> {args.target}")
    print("Pense a lancer : python scripts/ovh_dns.py refresh")


def cmd_delete(creds, args) -> None:
    call(creds, "DELETE", f"/domain/zone/{ZONE}/record/{args.id}")
    print(f"Supprime : id={args.id}")


def cmd_refresh(creds, _args) -> None:
    call(creds, "POST", f"/domain/zone/{ZONE}/refresh")
    print(f"Zone {ZONE} rechargee.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, default=None)
    sub = parser.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list")
    p_list.add_argument("--filter", default=None, help="A, CNAME, TXT, MX...")
    p_list.set_defaults(func=cmd_list)

    p_add = sub.add_parser("add")
    p_add.add_argument("--type", required=True)
    p_add.add_argument("--sub", default="", help="vide = apex")
    p_add.add_argument("--target", required=True)
    p_add.add_argument("--ttl", type=int, default=0)
    p_add.set_defaults(func=cmd_add)

    p_del = sub.add_parser("delete")
    p_del.add_argument("--id", required=True)
    p_del.set_defaults(func=cmd_delete)

    p_ref = sub.add_parser("refresh")
    p_ref.set_defaults(func=cmd_refresh)

    args = parser.parse_args()
    creds = load_credentials(resolve_env_file(args.env_file))
    args.func(creds, args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
