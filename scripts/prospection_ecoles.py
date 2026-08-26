"""Cherche les contacts d'associations etudiantes en passant par les ECOLES.

POURQUOI CE DETOUR, ET POURQUOI IL FALLAIT LE PRENDRE.

Chercher un BDE par son nom au repertoire des entreprises ne marche pas. Sur
1 044 associations etudiantes collectees ainsi, la devinette de domaine n'a
rendu que 3 adresses : une association n'a presque jamais de domaine a son nom.

Ce que les agents ont trouve, en revanche, dessine un motif net :

    bde@chartes.psl.eu      bde@insa-rouen.fr       bde@ens2m.fr
    bde@ensc.fr             bde@insa-strasbourg.fr  asso.bde@bordeaux.archi.fr

L'adresse vit sur le domaine de l'ETABLISSEMENT. Et l'etablissement, lui, a un
site stable, un domaine institutionnel, et une page « vie associative » que la
plupart publient. C'est une cible qu'on peut enumerer, contrairement a des noms
d'associations qu'il faudrait deviner.

SOURCE. Referentiel du ministere de l'Enseignement superieur, jeu de donnees
`fr-esr-principaux-etablissements-enseignement-superieur`, qui publie pour
chaque etablissement son intitule, sa commune, ses comptes sociaux et surtout
son `url`.

CE QUE CE MODULE NE FAIT PAS. Il ne devine aucune adresse. Une adresse est
retenue si et seulement si elle a ete LUE sur une page du site de
l'etablissement, et la colonne `source` porte l'URL de cette page. Sans elle,
la ligne ne vaut rien : c'est la source qui distingue une adresse d'une
supposition.
"""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

API_ESR = "https://data.enseignementsup-recherche.gouv.fr/api/records/1.0/search/"
JEU = "fr-esr-principaux-etablissements-enseignement-superieur"

MOTIF_EMAIL = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")

# Chemins ou un etablissement francais publie sa vie associative. La liste vient
# de l'observation des sites reellement visites, pas d'une intuition.
CHEMINS = [
    "/vie-etudiante", "/vie-associative", "/associations", "/vie-de-campus",
    "/campus/vie-etudiante", "/vie-etudiante/vie-associative",
    "/la-vie-etudiante", "/les-associations", "/vie-etudiante/associations",
    "/etudiants/vie-associative", "/campus", "/vie-du-campus",
]

# Une adresse ne nous interesse que si elle designe la vie etudiante. Le reste
# du site en publie d'autres - scolarite, presse, recrutement - qui ne sont pas
# le bon interlocuteur.
MOTS_ETUDIANTS = re.compile(
    r"(bde|bureau[- ]des[- ](eleves|etudiants)|vie[- ]associative|asso|"
    r"vie[- ]etudiante|bve|campus)", re.I
)

A_IGNORER = re.compile(
    r"(example|exemple|sentry|wixpress|@2x|\.png|\.jpg|\.svg|\.gif|@www\.|"
    r"votre-?email|nom@|email@|webmaster|no-?reply|noreply|presse|rgpd|dpo|"
    r"recrutement|candidature)", re.I,
)


def _page(url: str, taille: int = 250_000) -> str:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.read(taille).decode("utf-8", "ignore")
    except Exception:
        return ""


def etablissements() -> list[dict]:
    """Rend les etablissements du referentiel, avec leur site quand il existe."""
    sortie, debut = [], 0
    while True:
        params = {"dataset": JEU, "rows": 100, "start": debut}
        try:
            with urllib.request.urlopen(
                API_ESR + "?" + urllib.parse.urlencode(params), timeout=45
            ) as r:
                data = json.load(r)
        except Exception as err:
            print("  ! referentiel : {}".format(err))
            break
        lots = data.get("records") or []
        if not lots:
            break
        for rec in lots:
            f = rec.get("fields") or {}
            sortie.append({
                "uai": f.get("uai") or "",
                "etablissement": f.get("uo_lib") or f.get("uo_lib_officiel") or "",
                "sigle": f.get("sigle") or "",
                "commune": f.get("com_nom") or "",
                "departement": f.get("dep_nom") or "",
                "site": (f.get("url") or "").rstrip("/"),
                "instagram": f.get("compte_instagram") or "",
                "linkedin": f.get("compte_linkedin") or "",
                "telephone": f.get("numero_telephone_uai") or "",
            })
        debut += 100
        if debut >= data.get("nhits", 0):
            break
    return sortie


def _cherche_contact(etab: dict) -> dict:
    """Lit les pages de vie associative d'un etablissement et en extrait l'adresse.

    Deux niveaux de retenue, et c'est la nuance qui rend le resultat utilisable :

    - `email_bde` : l'adresse contient un marqueur etudiant (bde, asso, vie
      etudiante). C'est le bon interlocuteur.
    - `email_page` : une adresse lue sur une page de vie associative, sans ce
      marqueur. Elle vaut comme point d'entree, pas comme cible d'une sequence.
    """
    racine = etab.get("site") or ""
    if not racine.startswith("http"):
        return {**etab, "page_asso": "", "email_bde": "", "email_page": "", "source": ""}

    for chemin in CHEMINS:
        corps = _page(racine + chemin)
        if not corps or not MOTS_ETUDIANTS.search(corps):
            continue

        bde, quelconque = "", ""
        for brut in MOTIF_EMAIL.findall(corps):
            adresse = brut.lower().strip(".")
            if A_IGNORER.search(adresse):
                continue
            locale = adresse.partition("@")[0]
            if MOTS_ETUDIANTS.search(locale) and not bde:
                bde = adresse
            elif not quelconque:
                quelconque = adresse

        if bde or quelconque:
            return {**etab, "page_asso": racine + chemin, "email_bde": bde,
                    "email_page": quelconque, "source": racine + chemin}

    return {**etab, "page_asso": "", "email_bde": "", "email_page": "", "source": ""}


def collecte(parallele: int = 20) -> list[dict]:
    etabs = etablissements()
    avec_site = [e for e in etabs if e["site"].startswith("http")]
    print("{} etablissements, dont {} avec un site publie".format(
        len(etabs), len(avec_site)))

    resultats: list[dict] = []
    with ThreadPoolExecutor(max_workers=parallele) as pool:
        taches = {pool.submit(_cherche_contact, e): e for e in avec_site}
        for n, t in enumerate(as_completed(taches), 1):
            try:
                resultats.append(t.result())
            except Exception:
                resultats.append({**taches[t], "page_asso": "", "email_bde": "",
                                  "email_page": "", "source": ""})
            if n % 40 == 0:
                trouves = sum(1 for r in resultats if r.get("email_bde"))
                print("  {} / {} explores, {} adresses etudiantes".format(
                    n, len(avec_site), trouves))

    # Les etablissements sans site restent dans la sortie : ce sont eux les
    # meilleurs prospects, et les ecarter reviendrait a filtrer la cible.
    resultats += [{**e, "page_asso": "", "email_bde": "", "email_page": "",
                   "source": ""} for e in etabs if not e["site"].startswith("http")]
    return resultats
