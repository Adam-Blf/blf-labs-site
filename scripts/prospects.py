"""Constitue une base de prospects qualifies depuis l'annuaire public des entreprises.

POURQUOI CE SCRIPT EXISTE. Le moteur de prospection a ete livre avec une liste
vide, ce qui en faisait une machine sans carburant. Une liste batie a la main
n'est ni reproductible ni tracable : l'article 14 du RGPD impose de dire d'ou
vient une donnee qu'on n'a pas recue de la personne elle-meme, et la colonne
`contacts.source` existe pour ca. Ce script rend cette provenance verifiable.

SOURCE. API Recherche d'entreprises (recherche-entreprises.api.gouv.fr),
service public gratuit, sans cle, adosse aux bases Sirene et RNE. Elle ne
publie AUCUNE adresse email : ce script produit une base a qualifier, pas une
liste prete a l'envoi.

CE QUE LE FILTRE ECARTE, ET POURQUOI CE N'EST PAS UN DETAIL.

Les entrepreneurs individuels (nature juridique 1000) sont ecartes PAR DEFAUT,
et c'est un choix de prudence, pas une obligation. Il faut le dire exactement.

Le droit : l'article L34-5 du code des postes et des communications
electroniques n'exige le consentement prealable que pour les coordonnees d'une
PERSONNE PHYSIQUE. Une entreprise individuelle en est une. Mais la CNIL admet
l'interet legitime des lors que l'objet de la sollicitation est en rapport avec
la profession de la personne demarchee, ce qui couvre un artisan ecrit sur son
adresse professionnelle pour son site vitrine. La derogation explicite de la
CNIL, elle, ne vise que les adresses generiques de personnes MORALES : sur
l'entreprise individuelle, on quitte le texte pour la doctrine.

Le choix : l'exclusion est levable par `--inclure-entreprises-individuelles`.
Tant qu'elle tient, la liste ne repose que sur le fondement le plus solide.

Ce que la base exige, de son cote, n'est pas d'exclure mais de SAVOIR : depuis
la migration 0021, `nature_juridique` est obligatoire pour le regime sans
consentement prealable. Un SIREN seul ne dit pas si l'on ecrit a une personne
morale ou physique, et un registre qui se trompe sur sa base legale ne protege
personne.

Les structures qui se sont OPPOSEES a la diffusion de leurs donnees Sirene sont
ecartees. L'API publie ce statut, et l'ignorer reviendrait a demarcher des gens
qui ont explicitement demande a ne pas l'etre. Ce manquement-la se produit des
la collecte, avant le moindre envoi.

Les structures de 20 salaries et plus sont ecartees aussi, pour la raison
inverse : elles ont deja un prestataire.

CE QUE LE SCRIPT NE FAIT PAS. Il n'ecrit rien en base, il n'envoie rien, et il
ne cherche aucune adresse email. Sa sortie est un fichier a relire, hors du
depot, parce qu'un fichier de prospects porte des donnees relatives a des
personnes et n'a rien a faire dans un depot public.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://recherche-entreprises.api.gouv.fr/search"

# Sud du Val-de-Marne, autour de Chevilly-Larue. Le rayon prime sur le volume :
# un prestataire joignable en trente minutes est un argument, et c'est a peu
# pres le seul avantage qu'un independant local ait sur une agence.
COMMUNES = {
    "94021": "Chevilly-Larue",
    "94038": "L Hay-les-Roses",
    "94073": "Thiais",
    "94016": "Cachan",
    "94002": "Arcueil",
    "94081": "Villejuif",
    "94037": "Fresnes",
    "94068": "Rungis",
}

# Secteurs ou un site sert reellement a vendre, et ou son absence se paie. On
# evite volontairement les activites deja saturees de prestataires
# informatiques, qui n'achetent pas ce service.
#
# Le filtre porte sur `section_activite_principale`, une LETTRE, et non sur
# `activite_principale`. Ce dernier n'accepte qu'un code NAF complet du type
# "56.10A" : lui passer un prefixe a deux chiffres rend HTTP 400 sur chaque
# appel. La premiere version de ce script faisait exactement cela et n'aurait
# ramene aucune ligne, en echouant silencieusement secteur par secteur.
SECTIONS = {
    "I": "Hebergement et restauration",
    "F": "Construction",
    "G": "Commerce et reparation",
    "Q": "Sante humaine et action sociale",
    "S": "Autres services (coiffure, esthetique, reparation)",
    "P": "Enseignement",
    "R": "Arts, spectacles et loisirs",
    "M": "Activites specialisees, scientifiques et techniques",
}

# L'API plafonne le debit et repond 429 au-dela. Une seconde entre deux appels
# tient largement sous la limite, et le service est gratuit : le menager est la
# moindre des choses.
PAUSE = 1.0

# 1000 = entrepreneur individuel, donc personne physique. Voir l'entete.
NATURE_PERSONNE_PHYSIQUE = "1000"

# Statut de diffusion Sirene. Toute personne inscrite au repertoire peut demander
# a l'INSEE que ses donnees ne soient pas rendues publiques : c'est le droit
# d'opposition prevu a l'article A123-96 du code de commerce, et l'API le publie
# dans `statut_diffusion`. Seul "O" vaut diffusible.
#
# Ne PAS filtrer sur ce champ reviendrait a demarcher des structures qui ont
# explicitement demande a ne pas l'etre. C'est le premier manquement possible,
# et il se produit des la COLLECTE, avant meme le moindre envoi.
DIFFUSIBLE = "O"


def interroge(params: dict, essais: int = 3) -> dict:
    """Interroge l'API, en patientant si le debit est depasse plutot qu'en insistant."""
    url = API + "?" + urllib.parse.urlencode(params)
    for tentative in range(essais):
        try:
            with urllib.request.urlopen(url, timeout=40) as reponse:
                return json.load(reponse)
        except urllib.error.HTTPError as err:
            if err.code == 429 and tentative < essais - 1:
                time.sleep(2 * (tentative + 1))
                continue
            return {"_erreur": "HTTP {}".format(err.code)}
        except Exception as err:  # reseau, delai depasse
            if tentative < essais - 1:
                time.sleep(1.5 * (tentative + 1))
                continue
            return {"_erreur": str(err)}
    return {"_erreur": "epuise"}


def collecte(par_secteur: int, inclure_ei: bool = False) -> list[dict]:
    lignes: list[dict] = []
    vus: set[str] = set()

    for code_commune, nom_commune in COMMUNES.items():
        for section, libelle_secteur in SECTIONS.items():
            page = 1
            pris = 0
            while pris < par_secteur:
                data = interroge({
                    "code_commune": code_commune,
                    "section_activite_principale": section,
                    "etat_administratif": "A",
                    "tranche_effectif_salarie": "01,02,03,11",
                    "per_page": 25,
                    "page": page,
                })
                if "_erreur" in data:
                    print("  ! {}/{} : {}".format(nom_commune, section, data["_erreur"]),
                          file=sys.stderr)
                    break

                resultats = data.get("results") or []
                if not resultats:
                    break

                for entreprise in resultats:
                    siren = entreprise.get("siren")
                    if not siren or siren in vus:
                        continue
                    if (not inclure_ei
                            and entreprise.get("nature_juridique") == NATURE_PERSONNE_PHYSIQUE):
                        continue
                    siege = entreprise.get("siege") or {}
                    # Opposition a la diffusion, au niveau de l'unite legale ET
                    # de l'etablissement : les deux doivent valoir "O".
                    if entreprise.get("statut_diffusion") != DIFFUSIBLE:
                        continue
                    if siege.get("statut_diffusion_etablissement") != DIFFUSIBLE:
                        continue
                    vus.add(siren)
                    lignes.append({
                        "siren": siren,
                        "organisation": entreprise.get("nom_complet"),
                        "secteur": libelle_secteur,
                        "naf": entreprise.get("activite_principale"),
                        "commune": siege.get("libelle_commune") or nom_commune,
                        "code_postal": siege.get("code_postal") or "",
                        "adresse": siege.get("adresse") or "",
                        "date_creation": entreprise.get("date_creation") or "",
                        "effectif": entreprise.get("tranche_effectif_salarie") or "",
                        "nature_juridique": entreprise.get("nature_juridique") or "",
                        "statut_diffusion": entreprise.get("statut_diffusion") or "",
                        # A remplir a la main apres verification du site. La
                        # partie locale doit figurer dans la liste blanche de
                        # `contacts_b2b_strict`, sinon la base refuse la ligne.
                        "site_web": "",
                        "email_generique": "",
                        "a_deja_un_site": "",
                        "source": "annuaire-entreprises.data.gouv.fr",
                    })
                    pris += 1
                    if pris >= par_secteur:
                        break

                if page * 25 >= data.get("total_results", 0):
                    break
                page += 1
                time.sleep(PAUSE)

            time.sleep(PAUSE)
        print("  {:22} cumul {}".format(nom_commune, len(lignes)), file=sys.stderr)

    return lignes


def main() -> int:
    parseur = argparse.ArgumentParser(description=__doc__)
    parseur.add_argument("--par-secteur", type=int, default=4,
                         help="entreprises retenues par commune et par secteur")
    parseur.add_argument("--sortie", required=True,
                         help="chemin du CSV a ecrire, HORS du depot")
    parseur.add_argument("--inclure-entreprises-individuelles", action="store_true",
                         help="leve l'exclusion des personnes physiques (voir l'entete "
                              "avant de s'en servir : le fondement y est doctrinal, "
                              "pas textuel)")
    arguments = parseur.parse_args()

    if "blf-labs-site" in arguments.sortie.replace("\\", "/"):
        print("Refus : la sortie porte des donnees relatives a des personnes et "
              "ne doit pas etre ecrite dans le depot.", file=sys.stderr)
        return 2

    print("Collecte depuis l'annuaire public des entreprises", file=sys.stderr)
    lignes = collecte(arguments.par_secteur, arguments.inclure_entreprises_individuelles)

    if not lignes:
        print("Aucun resultat.", file=sys.stderr)
        return 1

    with open(arguments.sortie, "w", encoding="utf-8", newline="") as fichier:
        redacteur = csv.DictWriter(fichier, fieldnames=list(lignes[0].keys()))
        redacteur.writeheader()
        redacteur.writerows(lignes)

    print("\n{} structures ecrites dans {}".format(len(lignes), arguments.sortie),
          file=sys.stderr)
    print("Aucune adresse email : l'annuaire public n'en publie pas. La colonne "
          "`email_generique` se remplit a la main, et seule l'adresse generique "
          "d'une personne morale se demarche sans consentement prealable.",
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
