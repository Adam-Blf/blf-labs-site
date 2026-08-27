"""Garde : la liste blanche Python et celle de la base doivent coincider.

POURQUOI CETTE GARDE EXISTE.

La partie locale d'une adresse - `contact`, `info`, `office` - est ce qui
distingue une adresse de FONCTION d'une adresse de personne, et c'est sur elle
que repose tout le regime professionnel. Elle est ecrite deux fois : dans la
contrainte `contacts_b2b_strict` de la migration 0022, et dans
`LOCALES_ACCEPTEES` de `scripts/prospection.py`.

Deux copies d'une meme regle divergent au premier ajout. C'est arrive : la base
a ete ouverte aux formes anglaises et espagnoles pour l'international, la liste
Python est restee francaise, et `support@samsbarbers.com` - adresse
parfaitement fonctionnelle d'un salon de Dublin - a ete ecartee a l'import.

CE QUI REND CETTE DIVERGENCE-LA VICIEUSE. Elle ne casse rien. Une liste Python
plus large que la base produit un refus bruyant a l'ecriture ; une liste plus
stricte produit une perte SILENCIEUSE, avec un motif qui a l'air d'un controle
qui fonctionne. Rien ne la signale, et le manque ne se voit que si l'on compte
ce qui aurait du entrer.

Lancement : python scripts/check_prospection.py
"""

from __future__ import annotations

import io
import os
import re
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIGRATION = os.path.join(RACINE, "supabase", "migrations",
                         "0022_regimes_par_pays.sql")


def locales_de_la_base() -> set[str]:
    """Extrait la liste blanche de la contrainte, dans la migration."""
    with io.open(MIGRATION, encoding="utf-8") as f:
        sql = f.read()
    bloc = re.search(
        r"split_part\(lower\(email::text\), '@', 1\) = any \(array\[(.*?)\]\)",
        sql, re.S)
    if not bloc:
        raise SystemExit(
            "Liste blanche introuvable dans {}. Si la contrainte a ete "
            "reecrite, cette garde doit suivre : une garde qui ne trouve plus "
            "ce qu'elle surveille doit echouer, jamais rendre vert."
            .format(os.path.basename(MIGRATION)))
    return set(re.findall(r"'([^']+)'", bloc.group(1)))


def locales_du_script() -> set[str]:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from prospection import LOCALES_ACCEPTEES
    return set(LOCALES_ACCEPTEES)


def main() -> int:
    base, script = locales_de_la_base(), locales_du_script()
    if base == script:
        print("Liste blanche coherente : {} parties locales, base et script "
              "d'accord.".format(len(base)))
        return 0

    print("ECHEC : la liste blanche des adresses generiques a divergé.",
          file=sys.stderr)
    if base - script:
        print("  Dans la base, absentes du script - contacts PERDUS EN "
              "SILENCE a l'import : {}".format(
                  ", ".join(sorted(base - script))), file=sys.stderr)
    if script - base:
        print("  Dans le script, absentes de la base - refus bruyant a "
              "l'ecriture : {}".format(
                  ", ".join(sorted(script - base))), file=sys.stderr)
    print("\nLes deux vivent dans supabase/migrations/0022_regimes_par_pays.sql "
          "et scripts/prospection.py.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
