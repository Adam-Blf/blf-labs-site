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


# Cas de la preuve d'appartenance. Ils vivent ici plutot que dans un fichier de
# test separe parce que cette garde tourne deja en integration continue, et
# qu'une garde de plus qui ne tourne pas ne garde rien.
#
# Les trois derniers cas viennent du reel : le repertoire Sirene ecrit
# « LE PRE-SAINT-GERVAIS » et « SAINT-OUEN-SUR-SEINE », les sites ecrivent
# « Pre-Saint-Gervais » et « Saint Ouen sur Seine ». Une comparaison litterale
# rate ces communes, et une preuve qui rate se lit comme une absence de preuve :
# on ecarte alors un prospect parfaitement legitime.
CAS_DE_PREUVE = [
    ("commune nommee telle quelle",
     "Salon de coiffure a Vincennes", "VINCENNES", "94300", "commune"),
    ("code postal seul",
     "12 rue des Lilas, 94300", "AUTRE-VILLE", "94300", "code_postal"),
    ("site d'un prestataire, ne nomme rien du client",
     "Simplebo, creation de sites pour therapeutes", "VINCENNES", "94300", "aucune"),
    ("site injoignable, corpus vide",
     "", "VINCENNES", "94300", "aucune"),
    ("article initial absent du site",
     "institut au PRE-SAINT-GERVAIS", "LE PRE-SAINT-GERVAIS", "93310", "commune"),
    ("separateurs differents",
     "coiffeur a Saint Ouen sur Seine", "SAINT-OUEN-SUR-SEINE", "93400", "commune"),
    ("accents sur le site",
     "notre salon du Pre-Saint-Gervais", "LE PRE-SAINT-GERVAIS", "93310", "commune"),
    ("commune trop courte pour prouver quoi que ce soit",
     "bienvenue chez nous", "EU", "76260", "aucune"),
    ("ni commune ni code postal",
     "nous livrons partout en France", "MEUDON", "92190", "aucune"),
]


def controle_la_preuve() -> int:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from prospection import preuve_dappartenance

    echecs = 0
    for titre, corpus, commune, cp, attendu in CAS_DE_PREUVE:
        obtenu = preuve_dappartenance(corpus, commune, cp)
        if obtenu != attendu:
            echecs += 1
            print("ECHEC preuve : {} - attendu {}, obtenu {}".format(
                titre, attendu, obtenu), file=sys.stderr)
    if echecs:
        return 1
    print("Preuve d'appartenance : {} cas verifies.".format(len(CAS_DE_PREUVE)))
    return 0


def main() -> int:
    if controle_la_preuve():
        return 1
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
