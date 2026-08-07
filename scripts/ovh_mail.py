"""Pilote les redirections email du domaine beloucif.com chez OVH.

Pourquoi ce script existe
-------------------------
Le formulaire de commande envoie sa notification a adam@beloucif.com. Les
enregistrements MX du domaine pointent bien vers OVH, donc le message est
accepte par le serveur de reception - mais si AUCUNE redirection n'est definie
pour cette adresse, OVH n'a nulle part ou le deposer et le message est perdu
sans erreur visible cote expediteur. Resend affiche "delivered", et pourtant
rien n'arrive : c'est exactement le symptome constate.

Le script rend cette configuration verifiable et reproductible, au lieu de
dependre de clics dans l'interface OVH que personne ne peut relire ensuite.

SECRETS : les identifiants OVH ne sont jamais dans ce fichier ni dans le depot.
Ils sont lus par le module ovh_dns, depuis un fichier d'environnement externe,
et aucune valeur de cle n'est imprimee.

Usage :
  python scripts/ovh_mail.py list
  python scripts/ovh_mail.py add --from adam --to adambeloucif@gmail.com
  python scripts/ovh_mail.py delete --id 123456

A savoir avant de s'y fier : le script ne verifie PAS que la boite de
destination existe et accepte le courrier. Il configure la redirection ; la
preuve qu'un message arrive reellement demande un envoi de test.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Le client OVH (signature des requetes, lecture des identifiants) est deja
# ecrit et teste dans ovh_dns : on le reutilise plutot que de le dupliquer.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from ovh_dns import call, load_credentials, resolve_env_file  # noqa: E402

DOMAINE = "beloucif.com"


def lister(creds) -> list[dict]:
    """Renvoie toutes les redirections definies sur le domaine."""
    identifiants = call(creds, "GET", f"/email/domain/{DOMAINE}/redirection")
    details = []
    for identifiant in identifiants:
        details.append(
            call(creds, "GET", f"/email/domain/{DOMAINE}/redirection/{identifiant}")
        )
    return details


def cmd_list(creds, _args) -> int:
    redirections = lister(creds)
    if not redirections:
        print(f"Aucune redirection sur {DOMAINE}.")
        print("Tout message envoye a une adresse @beloucif.com est donc perdu.")
        return 0

    print(f"{len(redirections)} redirection(s) sur {DOMAINE} :")
    for item in redirections:
        print(f"  [{item['id']}] {item['from']} -> {item['to']}")
    return 0


def cmd_add(creds, args) -> int:
    source = args.source
    if "@" not in source:
        source = f"{source}@{DOMAINE}"

    # Idempotence : une seconde redirection identique ferait doublon et OVH
    # livrerait le message deux fois.
    for existante in lister(creds):
        if existante["from"] == source and existante["to"] == args.destination:
            print(f"Deja en place : {source} -> {args.destination}")
            return 0

    call(
        creds,
        "POST",
        f"/email/domain/{DOMAINE}/redirection",
        {
            "from": source,
            "to": args.destination,
            # Copie locale desactivee : sans boite reelle derriere l'adresse
            # source, la conserver ne ferait qu'accumuler du courrier nulle part.
            "localCopy": False,
        },
    )
    print(f"Redirection creee : {source} -> {args.destination}")
    print("La propagation cote OVH prend quelques minutes.")
    return 0


def cmd_delete(creds, args) -> int:
    call(creds, "DELETE", f"/email/domain/{DOMAINE}/redirection/{args.identifiant}")
    print(f"Redirection {args.identifiant} supprimee.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, default=None)
    sous = parser.add_subparsers(dest="commande", required=True)

    sous.add_parser("list", help="liste les redirections existantes")

    ajout = sous.add_parser("add", help="cree une redirection")
    ajout.add_argument(
        "--from", dest="source", required=True,
        help="adresse source, avec ou sans le domaine (ex : adam)",
    )
    ajout.add_argument(
        "--to", dest="destination", required=True,
        help="adresse de destination complete",
    )

    suppression = sous.add_parser("delete", help="supprime une redirection")
    suppression.add_argument("--id", dest="identifiant", required=True)

    args = parser.parse_args()
    creds = load_credentials(resolve_env_file(args.env_file))

    return {
        "list": cmd_list,
        "add": cmd_add,
        "delete": cmd_delete,
    }[args.commande](creds, args)


if __name__ == "__main__":
    raise SystemExit(main())
