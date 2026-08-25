"""Pose la politique DMARC de beloucif.com dans la zone DNS OVH.

POURQUOI CE SCRIPT EXISTE.

SPF et DKIM disent qui a le droit d'envoyer au nom du domaine. DMARC dit ce
qu'une messagerie doit FAIRE quand ni l'un ni l'autre ne colle, et ou envoyer
les rapports. Sans lui, un message usurpant beloucif.com n'est refuse par
personne, et personne ne le signale.

Depuis novembre 2025, Gmail et Yahoo ne se contentent plus de classer en
indesirable le courrier non conforme des expediteurs en volume : ils le
REJETTENT. Une campagne envoyee sans DMARC ne finit pas dans les indesirables,
elle n'arrive nulle part, et rien ne le dit a l'expediteur.

CE QUI EST POSE, ET POURQUOI DANS CET ORDRE.

  p=none          On observe avant de sanctionner. Une politique stricte posee
                  d'emblee sur un domaine qui envoie deja des factures et des
                  accuses de reception ferait disparaitre les messages
                  legitimes qu'on aurait mal configures, sans preavis.
                  Passage a p=quarantine apres deux semaines de rapports
                  propres, une seule ligne a changer ici.

  rua=adam@       Les rapports agreges vont a une adresse DU MEME DOMAINE. Une
                  adresse externe, gmail par exemple, exigerait un
                  enregistrement d'autorisation dans la zone du destinataire,
                  que nous ne controlons pas : les rapports ne partiraient
                  jamais, et le silence ressemblerait a un domaine propre.

  fo=1            Rapport d'echec des qu'un des deux mecanismes echoue, pas
                  seulement quand les deux echouent. C'est ce qui permet de
                  voir venir une rupture d'alignement avant qu'elle ne coute
                  des messages.

CE QUI N'EST PAS TOUCHE : les enregistrements MX de la racine, qui font
fonctionner adam@beloucif.com, et les enregistrements Resend deja en place. Ce
script n'ecrit que des TXT nommes _dmarc.

Usage :
  python scripts/setup_dmarc.py            # montre ce qui serait fait
  python scripts/setup_dmarc.py --apply    # ecrit dans la zone DNS
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ovh_dns import ZONE, call, load_credentials, resolve_env_file  # noqa: E402

# La politique, une seule fois. Les sous-domaines heritent de la racine en
# l'absence d'enregistrement propre, mais on les declare explicitement : un
# heritage implicite se perd au premier ajout de sous-domaine, et personne ne
# s'en apercoit avant de lire des rapports qui n'arrivent plus.
POLITIQUE = "v=DMARC1; p=none; rua=mailto:adam@beloucif.com; fo=1; adkim=r; aspf=r"

# Sous-domaine OVH -> valeur attendue. La chaine vide designe la racine.
ATTENDU: dict[str, str] = {
    "_dmarc": POLITIQUE,
    "_dmarc.send": POLITIQUE,
}


def enregistrements_txt(creds) -> list[dict]:
    """Toutes les entrees TXT de la zone, avec leur identifiant OVH."""
    ids = call(creds, "GET", f"/domain/zone/{ZONE}/record?fieldType=TXT")
    return [call(creds, "GET", f"/domain/zone/{ZONE}/record/{i}") for i in ids]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="ecrire dans la zone")
    parser.add_argument("--env-file", type=Path, default=None)
    args = parser.parse_args()

    creds = load_credentials(resolve_env_file(args.env_file))
    existants = {r.get("subDomain") or "": r for r in enregistrements_txt(creds)}

    actions: list[tuple[str, str, str]] = []
    for sous_domaine, valeur in ATTENDU.items():
        actuel = existants.get(sous_domaine)
        if actuel is None:
            actions.append(("creer", sous_domaine, valeur))
        elif actuel.get("target", "").strip('"') != valeur:
            actions.append(("corriger", sous_domaine, valeur))
        else:
            print(f"  deja conforme : {sous_domaine or '(racine)'}")

    if not actions:
        print("Rien a faire, la politique DMARC est deja en place.")
        return 0

    for verbe, sous_domaine, valeur in actions:
        cible = f"{sous_domaine}.{ZONE}" if sous_domaine else ZONE
        print(f"  {verbe} TXT {cible}")
        print(f"    {valeur}")

    if not args.apply:
        print("\nSimulation. Relancer avec --apply pour ecrire.")
        return 0

    for verbe, sous_domaine, valeur in actions:
        if verbe == "creer":
            call(
                creds,
                "POST",
                f"/domain/zone/{ZONE}/record",
                {"fieldType": "TXT", "subDomain": sous_domaine, "target": valeur, "ttl": 0},
            )
        else:
            identifiant = existants[sous_domaine]["id"]
            call(
                creds,
                "PUT",
                f"/domain/zone/{ZONE}/record/{identifiant}",
                {"target": valeur, "ttl": 0},
            )

    # Sans rafraichissement, OVH garde la zone precedente en service et le
    # controle qui suit rendrait un vert sur l'ancien etat.
    call(creds, "POST", f"/domain/zone/{ZONE}/refresh")
    print("\nZone rafraichie. Verifier avec :")
    print("  nslookup -type=TXT _dmarc.beloucif.com 1.1.1.1")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
