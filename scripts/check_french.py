"""Verifie et corrige les accents manquants dans le texte visible du site.

Pourquoi : le site a d'abord ete ecrit sans accents, par prudence d'encodage.
C'est une faute de francais, pas une precaution : "realisations",
"developpement" ou "methode" sans accent sont mal orthographies, et un site
professionnel ne peut pas les afficher.

Portee et limites, a connaitre avant de faire confiance a ce script :
  - il ne corrige QUE des mots figurant dans la table ci-dessous. Ce n'est pas
    un correcteur orthographique, il ne devine rien ;
  - il ignore le code : imports, noms de proprietes, classes CSS, chemins,
    identifiants. Seul le texte destine a l'affichage est touche ;
  - il respecte la casse initiale (Methode -> Methode accentue, METHODE reste
    en capitales, ou l'accent est facultatif en francais).

ANGLE MORT CONNU, mesure le 2026-08-11 : un paragraphe JSX qui contient une
interpolation `{...}` n'est PAS analyse. L'extraction du texte affiche exclut
les accolades pour ne pas toucher aux expressions, et un paragraphe comme
`<p>Les prix sont exprimes en euros. {SITE.vat}.</p>` est donc saute en entier.
Consequence reelle : les pages legales, qui interpolent le SIRET, l'adresse et
le mediateur a chaque phrase, etaient invisibles pour cette garde. Vingt fautes
d'accent y ont survecu jusqu'a une relecture manuelle.

Tant que ce n'est pas corrige, un "Aucun accent manquant detecte" ne vaut PAS
pour les pages a forte interpolation. Les relire a la main.

Usage :
  python scripts/check_french.py           # signale, ne modifie rien
  python scripts/check_french.py --fix     # applique les corrections
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCAN_DIRS = ["app", "components", "content", "lib"]
SUFFIXES = {".ts", ".tsx"}

# Mot sans accent -> mot correct. Uniquement des mots dont la forme non
# accentuee n'existe pas en francais, pour eviter toute correction abusive.
WORDS: dict[str, str] = {
    "realisation": "réalisation",
    "realisations": "réalisations",
    "developpement": "développement",
    "developpeur": "développeur",
    "developpe": "développé",
    "developpees": "développées",
    "methode": "méthode",
    "reponse": "réponse",
    "repondre": "répondre",
    "delai": "délai",
    "delais": "délais",
    "detail": "détail",
    "details": "détails",
    "etape": "étape",
    "etapes": "étapes",
    "ecran": "écran",
    "ecrans": "écrans",
    "ecrire": "écrire",
    "ecrit": "écrit",
    "ecrite": "écrite",
    "ecrites": "écrites",
    "echange": "échange",
    "echeance": "échéance",
    "verifie": "vérifié",
    "verifiez": "vérifiez",
    "referencement": "référencement",
    "reference": "référence",
    "references": "références",
    "perimetre": "périmètre",
    "numerique": "numérique",
    "numeriques": "numériques",
    "creation": "création",
    "cree": "créé",
    "creer": "créer",
    "securite": "sécurité",
    "propriete": "propriété",
    "societe": "société",
    "donnees": "données",
    "annee": "année",
    "annees": "années",
    "apres": "après",
    "tres": "très",
    "deja": "déjà",
    "meme": "même",
    "memes": "mêmes",
    "etre": "être",
    "acces": "accès",
    "succes": "succès",
    "proces": "procès",
    "cles": "clés",
    "cle": "clé",
    "budgetaire": "budgétaire",
    "generale": "générale",
    "generales": "générales",
    "general": "général",
    "legale": "légale",
    "legales": "légales",
    "mediateur": "médiateur",
    "mediation": "médiation",
    "conformement": "conformément",
    "regle": "règle",
    "regles": "règles",
    "modele": "modèle",
    "problemes": "problèmes",
    "probleme": "problème",
    "systeme": "système",
    "interesse": "intéressé",
    "necessaire": "nécessaire",
    "necessaires": "nécessaires",
    "prealable": "préalable",
    "prevu": "prévu",
    "prevue": "prévue",
    "presente": "présente",
    "presentes": "présentes",
    "presentation": "présentation",
    "precise": "précise",
    "precisions": "précisions",
    "operationnel": "opérationnel",
    "immatricule": "immatriculé",
    "enregistre": "enregistré",
    "enregistrees": "enregistrées",
    "livre": "livré",
    "livres": "livrés",
    "livree": "livrée",
    "livrees": "livrées",
    "concu": "conçu",
    "concue": "conçue",
    "concus": "conçus",
    "recu": "reçu",
    "recue": "reçue",
    "recus": "reçus",
    "facon": "façon",
    "francais": "français",
    "francaise": "française",
    "voila": "voilà",
    "deroule": "déroule",
    "derouler": "dérouler",
    "edite": "édité",
    "edition": "édition",
    "editeur": "éditeur",
    "integres": "intégrés",
    "integral": "intégral",
    "integrale": "intégrale",
    "parallele": "parallèle",
    "parite": "parité",
    "reservee": "réservée",
    "proprietaire": "propriétaire",
    "hebergement": "hébergement",
    "heberge": "hébergé",
    "hebergeur": "hébergeur",
    "therapie": "thérapie",
    "soiree": "soirée",
    "publiees": "publiées",
    "publiee": "publiée",
    "economie": "économie",
    "elements": "éléments",
    "element": "élément",
    "citees": "citées",
    "caracteres": "caractères",
    "resolution": "résolution",
    "reclamation": "réclamation",
    "adressee": "adressée",
    "ete": "été",
    "restee": "restée",
    "decrit": "décrit",
    "decrite": "décrite",
    "decrivez": "décrivez",
    "confidentialite": "confidentialité",
    "identite": "identité",
    "complete": "complète",
    "reglement": "règlement",
    "reglementation": "réglementation",
    "specifiques": "spécifiques",
    "cedes": "cédés",
    "generiques": "génériques",
    "bibliotheques": "bibliothèques",
    "regis": "régis",
    "conformites": "conformités",
    "signalees": "signalées",
    "corrigees": "corrigées",
    "evolutions": "évolutions",
    "retractation": "rétractation",
    "retracter": "rétracter",
    "responsabilite": "responsabilité",
    "plafonnee": "plafonnée",
    "concernee": "concernée",
    "penalites": "pénalités",
    "interet": "intérêt",
    "indemnite": "indemnité",
    "decale": "décale",
    "detenir": "détenir",
    "prevaut": "prévaut",
    "indique": "indiqué",
    "exprimes": "exprimés",
    "differente": "différente",
    "signe": "signé",
    "realise": "réalisé",
    "traitee": "traitée",
    "reessayez": "réessayez",
    "envoyee": "envoyée",
    "resumer": "résumer",
    "numero": "numéro",
    "controle": "contrôle",
    "cote": "côté",
    "installee": "installée",
    "separement": "séparément",
    "chiffrees": "chiffrées",
    "complementaires": "complémentaires",
    "recuperation": "récupération",
    "seance": "séance",
    "declinaisons": "déclinaisons",
    "deja": "déjà",

    # Cedilles. Le c cedille se perd aussi facilement que l'accent, et
    # "ca se passe" ou "facon" sont tout aussi fautifs que "methode".
    "ca": "ça",
    "cedes": "cédés",
    "remplacant": "remplaçant",
    "lecon": "leçon",
    "apercu": "aperçu",
    "garcon": "garçon",
    "recoit": "reçoit",
    "apercoit": "aperçoit",
    "deca": "deçà",
    "maconnerie": "maçonnerie",
    "soupcon": "soupçon",
    "rincage": "rinçage",
    "placant": "plaçant",
    "forcant": "forçant",
    "lancant": "lançant",
    "commencant": "commençant",
    "prononcant": "prononçant",
    "remplacons": "remplaçons",
    "commencons": "commençons",
    "avancons": "avançons",
    "lancons": "lançons",
}

# Mots trop ambigus pour une substitution automatique : "des", "ou", "cote" et
# "livre" existent tels quels en francais, et "reference" est aussi un terme de
# code. On les retire de la table active plutot que de risquer une correction
# fautive. "ca" reste actif : l'extraction ne porte que sur du texte affiche.
AMBIGUOUS = {
    "des",
    "ou",
    "cle",
    "cles",
    "livre",
    "livres",
    "reference",
    "cote",
    "commence",
    "annonce",
    "francs",
    "recevez",
    "prestations",
    "obligatoires",
    "facultatif",
    "acquis",
    "protection",
    "affaires",
    "imputable",
    "surveillance",
    "sauvegardes",
    "praticienne",
    "modifiables",
    "validations",
    "concernant",
    "avancement",
    "graphiques",
    "fonctionnelles",
    "recouvrement",
    "seance",
    "renouvellement",
}
SAFE_WORDS = {k: v for k, v in WORDS.items() if k not in AMBIGUOUS}


def visible_strings(text: str) -> list[tuple[int, int, str]]:
    """Renvoie les segments de texte affiche, avec leurs bornes.

    Deux sources, et il faut les deux : une premiere version ne prenait que le
    texte tenant sur une seule ligne, ce qui accentuait un mot sur deux dans un
    paragraphe JSX reparti sur plusieurs lignes - un resultat plus incoherent
    que l'absence totale d'accents.

    Sont exclus : les imports, les valeurs d'attribut techniques (className,
    href, src, id), et toute chaine ressemblant a un chemin ou un identifiant.
    """
    segments: list[tuple[int, int, str]] = []

    # Zones a ne jamais toucher : attributs techniques et imports.
    forbidden: list[tuple[int, int]] = []
    for match in re.finditer(
        r'(?:className|href|src|id|key|name|slug|htmlFor|rel|target|type|alt|'
        r'aria-\w+|data-\w+)=\{?["\'`][^"\'`]*["\'`]\}?',
        text,
    ):
        forbidden.append((match.start(), match.end()))
    # Toute ligne d'import, y compris celles qui tiennent sur plusieurs lignes.
    # Un identifiant importe est du code : l'accentuer casse la compilation.
    for match in re.finditer(r"^\s*import\b[\s\S]*?(?:;|$)", text, flags=re.M):
        forbidden.append((match.start(), match.end()))
    for match in re.finditer(r'^.*\bfrom\s+["\'].*$', text, flags=re.M):
        forbidden.append((match.start(), match.end()))

    # ACCES DE PROPRIETE : `r.numero`, `invoice.mode`, `SITE.vat`.
    #
    # Un nom de propriete est un identifiant, pas un mot francais : l'accentuer
    # casse la compilation, ce que l'en-tete de ce fichier raconte avoir deja
    # subi sur un import. Le cas manquait, et il a fait remonter `r.numero` du
    # livre des recettes comme une faute d'accent a corriger - un vert menteur
    # dans l'autre sens : un rapport qui designe du code fait douter de tout ce
    # qu'il designe.
    #
    # Le motif exige un identifiant DE PART ET D'AUTRE du point. Une phrase
    # francaise met une espace apres le point, elle n'est donc jamais touchee.
    for match in re.finditer(r"\w+\.\w+", text):
        forbidden.append((match.start(), match.end()))

    # Commentaires : ce n'est pas du texte affiche. Les corriger fait du bruit
    # dans le rapport et masque les vraies fautes, visibles par un lecteur.
    for match in re.finditer(r"//[^\n]*|/\*[\s\S]*?\*/|^\s*\*[^\n]*", text, flags=re.M):
        forbidden.append((match.start(), match.end()))

    def is_forbidden(start: int, end: int) -> bool:
        # CHEVAUCHEMENT et non inclusion. La version precedente exigeait que le
        # segment soit entierement contenu dans la zone interdite : un segment
        # qui commencait dans un import et se terminait apres passait au travers,
        # et c'est ainsi que `import { Methode }` devenait `import { Méthode }`,
        # exactement la panne que l'en-tete de ce fichier dit avoir deja subie.
        return any(start < b and a < end for a, b in forbidden)

    # Motifs qui trahissent du code et non du texte affiche. Sans ce filtre, un
    # segment ouvert sur `/>` et referme sur le `<` d'une balise plus bas
    # englobe les lignes intermediaires : c'est ainsi qu'une premiere version a
    # renomme l'import `Methode` en `Méthode` et casse la compilation.
    CODE_MARKERS = (
        "import ",
        "from ",
        "export ",
        "=>",
        "();",
        "const ",
        "return",
        "className",
        "://",
    )

    def looks_like_code(value: str) -> bool:
        return any(marker in value for marker in CODE_MARKERS)

    # Texte entre balises JSX, y compris sur plusieurs lignes. Les accolades
    # sont exclues du segment pour ne pas toucher aux expressions.
    for match in re.finditer(r">([^<>{}]{3,}?)<", text, flags=re.S):
        value = match.group(1)
        if is_forbidden(match.start(1), match.end(1)) or looks_like_code(value):
            continue
        segments.append((match.start(1), match.end(1), value))

    # Chaines de caracteres en francais, sur une ou plusieurs lignes.
    for match in re.finditer(r'"([^"]{6,}?)"', text, flags=re.S):
        value = match.group(1)
        # `looks_like_code` MANQUAIT ICI, alors qu'il filtre deja la source
        # JSX juste au-dessus. Consequence mesuree le 20/08/2026 : entre deux
        # chaines eloignees, l'expression reguliere capture tout le code qui les
        # separe, et ce bloc - `const rows = recettes.map((r) => [r.date,
        # r.numero, ...]` - etait analyse comme du texte affiche. Le rapport
        # demandait alors d'accentuer `numero`, c'est-a-dire de renommer une
        # propriete TypeScript : exactement la panne que l'en-tete de ce
        # fichier raconte avoir deja subie sur un import.
        if is_forbidden(match.start(1), match.end(1)) or looks_like_code(value):
            continue
        # Un chemin, une URL ou un identifiant technique n'est pas du texte.
        if re.search(r"(https?:|/|@|^\w+-\w+$|\bpx\b|\brem\b|_)", value):
            continue
        if " " not in value:
            continue
        segments.append((match.start(1), match.end(1), value))

    return segments


def fix_segment(segment: str) -> tuple[str, list[str]]:
    hits: list[str] = []

    def replace(match: re.Match[str]) -> str:
        word = match.group(0)
        lowered = word.lower()
        if lowered not in SAFE_WORDS:
            return word
        # Les capitales integrales sont laissees telles quelles : l'accent y est
        # facultatif en francais et souvent supprime par le style CSS.
        if word.isupper():
            return word
        fixed = SAFE_WORDS[lowered]
        if word[0].isupper():
            fixed = fixed[0].upper() + fixed[1:]
        hits.append(f"{word} -> {fixed}")
        return fixed

    return re.sub(r"\b[A-Za-z]+\b", replace, segment), hits


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fix", action="store_true")
    args = parser.parse_args()

    total = 0
    touched = 0

    for directory in SCAN_DIRS:
        for path in sorted((ROOT / directory).rglob("*")):
            if path.suffix not in SUFFIXES or not path.is_file():
                continue

            original = path.read_text(encoding="utf-8")
            text = original
            file_hits: list[str] = []

            # On traite de la fin vers le debut pour ne pas decaler les bornes.
            for start, end, segment in reversed(visible_strings(original)):
                fixed, hits = fix_segment(segment)
                if hits:
                    file_hits.extend(hits)
                    text = text[:start] + fixed + text[end:]

            if file_hits:
                total += len(file_hits)
                touched += 1
                relative = path.relative_to(ROOT)
                print(f"{relative} : {len(file_hits)} correction(s)")
                for hit in sorted(set(file_hits))[:6]:
                    print(f"    {hit}")
                if args.fix:
                    path.write_text(text, encoding="utf-8")

    if not total:
        print("Aucun accent manquant detecte.")
        return 0

    print(f"\n{total} correction(s) dans {touched} fichier(s)")
    if not args.fix:
        print("Relancez avec --fix pour appliquer.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
