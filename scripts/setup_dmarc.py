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

  p=quarantine    Applique depuis le 2026-08-25, sans passer deux semaines en
                  `p=none`. A volume quasi nul, ces deux semaines n'auraient
                  produit presque aucun rapport, donc aucune information : on
                  aurait attendu pour rien.
                  Ce qui remplace les rapports, ce n'est pas la foi, ce sont des
                  tests d'envoi actifs. Mesure du jour, flux de prospection
                  envoye a mail-tester : note 10 sur 10, `dmarc=pass`, DKIM
                  `d=beloucif.com` selecteur `resend`, SPF `Pass`.
                  L'argument qui autorise a durcir tout de suite : `quarantine`
                  ne bloque QUE ce qui echoue deja l'alignement. Un message
                  correctement aligne passe a l'identique en `none` et en
                  `quarantine`, donc le test prouve l'absence de regression en
                  quelques minutes plutot qu'en quinze jours.
                  Passage a `p=reject` a reevaluer le 2026-09-22.

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
# Les rapports partent vers une adresse DEDIEE, pas vers la boite principale.
# Ils arrivent en XML compresse, plusieurs par jour des qu'il y a du volume, et
# noyes dans le courrier courant ils cessent d'etre lus au bout de trois jours.
# `dmarc@beloucif.com` redirige vers la meme boite, mais se filtre.
#
# L'adresse est sur le MEME domaine, et ce n'est pas un detail : un `rua` vers
# un domaine tiers exige un enregistrement d'autorisation dans la zone du
# destinataire, faute de quoi les rapports ne partent jamais. Le silence
# ressemblerait alors a un domaine parfaitement propre.
RAPPORTS = "mailto:dmarc@beloucif.com"

# PAS DE `fo=1`. Ce tag ne gouverne QUE les rapports d'echec detailles, qui
# n'existent pas sans un tag `ruf`. Pose seul, il est purement decoratif. Il
# etait la depuis ce matin, il degage.
#
# PAS DE `ruf` NON PLUS. Presque aucun fournisseur n'en emet, ni Google, ni
# Microsoft, ni Yahoo, donc l'information attendue n'arriverait pas. Ceux qui
# en emettent joignent des en-tetes et parfois le corps du message, soit des
# donnees personnelles de tiers qu'on recevrait sans besoin reel.
#
# PAS DE `pct=` intermediaire. A ce volume il echantillonne quelques messages au
# hasard, n'apporte aucun signal statistique, et ajoute une variable au
# diagnostic : un message passe, etait-ce l'alignement ou le tirage. Il se
# justifie a des dizaines de milliers de messages sur des flux inconnus. Ici
# l'inventaire tient en trois lignes.
#
# ALIGNEMENT RELACHE, et definitivement. Mesure du 2026-08-25 : le DKIM signe
# `d=beloucif.com` et s'aligne donc strictement, mais l'enveloppe SPF part de
# `send.beloucif.com`. Un `aspf=s` ferait echouer SPF sur tout le courrier
# Resend, factures comprises, pour se premunir d'un attaquant capable de publier
# du DNS sous le domaine - or s'il en est la, DMARC n'est plus le probleme.
POLITIQUE = f"v=DMARC1; p=quarantine; sp=quarantine; rua={RAPPORTS}; adkim=r; aspf=r"

# Le sous-domaine n'a pas besoin de `sp`, il n'a pas de sous-domaine a lui.
POLITIQUE_SOUS_DOMAINE = f"v=DMARC1; p=quarantine; rua={RAPPORTS}; adkim=r; aspf=r"

# Sous-domaine OVH -> valeur attendue. La chaine vide designe la racine.
ATTENDU: dict[str, str] = {
    "_dmarc": POLITIQUE,
    "_dmarc.send": POLITIQUE_SOUS_DOMAINE,
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
