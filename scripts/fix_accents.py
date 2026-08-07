"""Restaure les accents manquants dans les fichiers de contenu.

Pourquoi ce script existe
-------------------------
Le contenu a ete redige au fil de l'eau, en partie sans accents. Sur un site
entierement en francais, un "delai" ou un "en tete" visible est une faute, pas
un detail de style.

Portee volontairement etroite, et c'est le point important. Une version
precedente de ce traitement operait sur tout le depot et a renomme des
identifiants de code - `Methode` est devenu `Méthode` dans une instruction
d'import, `etape` est devenu `étape` dans une fonction de rappel - ce qui a
casse la compilation. Le script ne regarde donc plus que `content/`, ou il n'y
a que des chaines destinees a l'affichage, et il saute les lignes d'import, de
type et de commentaire.

Ce que le script NE voit PAS, a savoir avant de s'y fier :
  - les chaines ecrites directement dans les composants (`components/`, `app/`),
    qui restent a corriger a la main ;
  - les mots accentues ambigus qu'il ne traite pas, comme "cote" qui peut etre
    "côté" ou "cote" ;
  - la grammaire et les accords, qu'aucune table de mots ne peut verifier.

Usage : python scripts/fix_accents.py
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Mots dont la forme non accentuee n'existe pas en francais : la substitution
# est donc sure, quel que soit le contexte.
MOTS: dict[str, str] = {
    r"\ben tete\b": "en tête",
    r"\bdelai\b": "délai",
    r"\bdelais\b": "délais",
    r"\breponse\b": "réponse",
    r"\breponses\b": "réponses",
    r"\bintegre\b": "intégré",
    r"\bintegres\b": "intégrés",
    r"\bqualite\b": "qualité",
    r"\bsecurite\b": "sécurité",
    r"\bdonnees\b": "données",
    r"\brealisation\b": "réalisation",
    r"\brealisations\b": "réalisations",
    r"\betape\b": "étape",
    r"\betapes\b": "étapes",
    r"\bmethode\b": "méthode",
    r"\bmethodes\b": "méthodes",
    r"\btres\b": "très",
    r"\bapres\b": "après",
    r"\bdeja\b": "déjà",
    r"\bmaniere\b": "manière",
    r"\bprecis\b": "précis",
    r"\bcree\b": "créé",
    r"\bdeploie\b": "déploie",
    r"\bmise a jour\b": "mise à jour",
    r"\bverifiable\b": "vérifiable",
    r"\bverifie\b": "vérifie",
    r"\betabli\b": "établi",
    r"\bechange\b": "échange",
    r"\bechanges\b": "échanges",
    r"\bperimetre\b": "périmètre",
    r"\bacces\b": "accès",
    r"\bdeveloppement\b": "développement",
    r"\bdeveloppeur\b": "développeur",
    r"\bdecrivez\b": "décrivez",
    r"\bdecouvrez\b": "découvrez",
    r"\bresultat\b": "résultat",
    r"\bdepot\b": "dépôt",
    r"\bintermediaire\b": "intermédiaire",
    r"\becrit\b": "écrit",
    r"\bsupplement\b": "supplément",
    r"\bduree\b": "durée",
    r"\bbeneficie\b": "bénéficie",
    r"\bimpots\b": "impôts",
    r"\bgeographique\b": "géographique",
    r"\bdediee\b": "dédiée",
    r"\bdediees\b": "dédiées",
    r"\brepere\b": "repère",
    r"\bhonnete\b": "honnête",
    r"\breferencement\b": "référencement",
    r"\bstructurees\b": "structurées",
    r"\bmodelise\b": "modélise",
    r"\bmodele\b": "modèle",
    r"\bmetier\b": "métier",
    r"\bpenible\b": "pénible",
    r"\bbalisee\b": "balisée",
    r"\blegales\b": "légales",
    r"\blegale\b": "légale",
    r"\bequipes\b": "équipes",
    r"\bevolutions\b": "évolutions",
    r"\bau dela\b": "au-delà",
    r"\bdes les\b": "dès les",
    r"\bgeneral\b": "général",
    r"\bfacon\b": "façon",
    r"\bcout\b": "coût",
    r"\bcoute\b": "coûte",
    r"\bcompetences\b": "compétences",
    r"\bexperience\b": "expérience",
    r"\bfonctionnalites\b": "fonctionnalités",
    r"\bpreference\b": "préférence",
    r"\bnecessaire\b": "nécessaire",
    r"\bpremiere\b": "première",
    r"\bderniere\b": "dernière",
    r"\bcompleta?\b": "complet",
    r"\bdetail\b": "détail",
    r"\bdetails\b": "détails",
    r"\bprevu\b": "prévu",
    r"\bprevue\b": "prévue",
}

# Participes et noms homographes volontairement absents de la table :
# "partage" (le partage / partagé), "termine" (il termine / terminé),
# "annonce" (une annonce / annoncé), "impose" (il impose / imposé),
# "publiee" sans contexte. Les accentuer mecaniquement produirait des fautes
# dans l'autre sens ; ils restent a corriger a la lecture.

# La preposition "a" s'accentue, le verbe avoir non. Le mot qui precede tranche.
# Le sujet est CAPTURE plutot que regarde en arriere : une assertion arriere
# exige une largeur fixe, ce que cette liste n'a pas.
SUJETS_AVOIR = {
    "y", "n'", "on", "il", "elle", "qui", "ça", "ca",
    "projet", "studio", "site", "client", "entreprise", "chacun",
}
RE_PREPOSITION_A = re.compile(r"(\w+'?|^)( a )(?=[a-zà-ÿ0-9])", re.IGNORECASE)


def _accentuer_a(occurrence: re.Match[str]) -> str:
    precedent = occurrence.group(1)
    if precedent.lower() in SUJETS_AVOIR:
        return occurrence.group(0)
    return f"{precedent} à "

# Lignes de code : aucun texte affichable, donc jamais touchees.
RE_LIGNE_DE_CODE = re.compile(r"\s*(import|export\s+(type|interface)|type\s|//|\*)")


# Chaine litterale TypeScript : "..." ou '...' ou `...`. C'est la SEULE zone que
# le script a le droit de modifier.
#
# Cette garde remplace un filtrage par ligne qui s'est revele insuffisant : il
# laissait passer les cles d'objet, et le script a renomme le champ `detail` en
# `détail` dans content/options.ts, ce qui a casse la compilation. Une cle
# d'objet n'est pas entre guillemets, une chaine affichee l'est toujours : c'est
# ce critere, et non la position dans la ligne, qui separe le texte du code.
RE_CHAINE = re.compile(r'"[^"\n]*"' + r"|'[^'\n]*'" + r"|`[^`]*`", re.DOTALL)


def _corriger_chaine(occurrence: re.Match[str]) -> str:
    texte = occurrence.group(0)
    for motif, remplacement in MOTS.items():
        texte = re.sub(motif, remplacement, texte)
    return RE_PREPOSITION_A.sub(_accentuer_a, texte)


def corriger(texte: str) -> str:
    """Corrige uniquement l'interieur des chaines littérales."""
    lignes = []
    for ligne in texte.split("\n"):
        # Les lignes d'import et de commentaire contiennent des chaines qui ne
        # sont jamais affichees : on les laisse telles quelles.
        if RE_LIGNE_DE_CODE.match(ligne):
            lignes.append(ligne)
        else:
            lignes.append(RE_CHAINE.sub(_corriger_chaine, ligne))
    return "\n".join(lignes)


def main() -> int:
    modifies = 0
    for chemin in sorted((ROOT / "content").glob("*.ts")):
        avant = chemin.read_text(encoding="utf-8")
        apres = corriger(avant)
        if apres != avant:
            chemin.write_text(apres, encoding="utf-8")
            modifies += 1
            print(f"  corrige : {chemin.relative_to(ROOT)}")

    print(f"{modifies} fichier(s) de contenu corriges.")
    print("Rappel : les chaines de components/ et app/ ne sont PAS couvertes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
