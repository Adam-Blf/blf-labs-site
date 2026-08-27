"""Collecte de prospects HORS DE FRANCE, par OpenStreetMap.

    python scripts/prospection_monde.py --pays GB --sortie monde.csv
    python scripts/prospection_monde.py --pays GB,IE,BE --villes 6 --sortie monde.csv

Le fichier produit a les memes colonnes que `prospection.py`, il passe donc par
les memes sous-commandes ensuite :

    python scripts/prospection.py verifier --fichier monde.csv
    python scripts/prospection.py importer --fichier monde.csv
    python scripts/prospection.py engager --confirmer

POURQUOI UNE AUTRE SOURCE, ET PAS UN AUTRE PAYS DANS LE MEME OUTIL.

`recherche-entreprises.api.gouv.fr` est l'annuaire francais. Il n'a pas
d'equivalent international gratuit et uniforme : Companies House ne couvre que
le Royaume-Uni et ne publie aucune adresse, les registres europeens sont
disjoints et souvent payants, et les annuaires commerciaux facturent au contact.

OpenStreetMap couvre le monde, est gratuit, et - c'est ce qui compte ici - ses
fiches de commerces portent tres souvent une balise `website`. On s'en sert pour
trouver le SITE, jamais pour en tirer une adresse email directement.

CE POINT N'EST PAS UN DETAIL DE MISE EN OEUVRE.

OpenStreetMap porte parfois une balise `contact:email`, et il serait tentant de
la moissonner. On ne le fait pas. Une balise peut avoir ete posee par un
contributeur tiers, ce qui n'est pas la meme chose qu'une adresse publiee par la
structure elle-meme sur son propre site. L'article 14 du RGPD oblige a dire
l'origine de la donnee dans le premier message : « relevee sur le site public de
votre structure » est verifiable par le destinataire, « relevee sur une carte
collaborative » l'expose a decouvrir que quelqu'un d'autre a publie son adresse.

La regle est donc identique a celle du collecteur francais : une adresse est
retenue si et seulement si elle a ete LUE sur le site de la structure, et c'est
`prospection.py verifier` qui s'en charge, avec ses gardes deja eprouvees -
liste blanche de parties locales, rejet des adresses nominatives, rejet des
domaines revendiques par plusieurs structures.

CE QUE CE MODULE NE DECIDE PAS. Le droit applicable. La table `regimes_pays` en
base refuse tout pays qui n'y figure pas comme admettant le courriel
professionnel sans consentement prealable, et la garde de sortie repose la
question avant chaque envoi. Ce module se contente de refuser en amont, pour ne
pas collecter ce que la base rejettera : voir PAYS_OUVERTS.

CADENCE. Overpass est un service benevole, bien plus fragile qu'une API d'Etat.
Sa politique demande de ne pas depasser deux requetes simultanees et de laisser
le serveur respirer. On interroge SEQUENTIELLEMENT, avec une pause franche entre
deux appels. Un tir a cinq par seconde sur l'annuaire francais - pourtant
dimensionne pour - a fini par faire fermer la connexion pendant quarante-cinq
minutes ; il n'y a aucune raison de traiter plus mal un serveur qui tient sur
des dons.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prospection import COLONNES, ecris, refuse_le_depot  # noqa: E402

# Plusieurs instances servent la meme API. L'instance principale refuse
# regulierement par 504 « aucun creneau libre » : ce n'est pas une panne, c'est
# une file d'attente, et insister dessus ne fait qu'allonger la file. On passe
# a la suivante plutot que de marteler la premiere.
MIROIRS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# Pause entre deux requetes Overpass, en secondes. La politique du service parle
# de « quelques » requetes par minute pour un usage automatise : on se tient
# largement en dessous.
PAUSE = 6.0

# Les pays que la base accepte en regime professionnel, recopies ici pour
# refuser AVANT de collecter. La table `regimes_pays` reste l'autorite : si les
# deux divergent, c'est la base qui tranche, et elle tranche en refusant.
#
# Les absents notables, et pourquoi : Allemagne et Autriche exigent un
# consentement prealable meme entre professionnels, l'Espagne et l'Italie aussi,
# le Canada egalement. Les collecter serait constituer un fichier qu'on n'a pas
# le droit d'utiliser.
PAYS_OUVERTS = {
    "BE": "Belgique", "LU": "Luxembourg", "NL": "Pays-Bas", "PT": "Portugal",
    "CH": "Suisse", "GB": "Royaume-Uni", "IE": "Irlande", "US": "Etats-Unis",
    "MX": "Mexique", "AR": "Argentine", "CL": "Chili", "FR": "France",
}

# Villes visees, par pays, de la plus grande a la plus petite. Le rayon est en
# metres et suit l'etalement reel de l'agglomeration : Los Angeles n'a pas la
# densite de Bruxelles, et un meme rayon rendrait un champ vide ici et une
# requete impossible a servir la-bas.
VILLES: dict[str, list[tuple[str, float, float, int]]] = {
    "GB": [("London", 51.5074, -0.1278, 12000), ("Manchester", 53.4808, -2.2426, 8000),
           ("Birmingham", 52.4862, -1.8904, 8000), ("Leeds", 53.8008, -1.5491, 7000),
           ("Glasgow", 55.8642, -4.2518, 7000), ("Bristol", 51.4545, -2.5879, 6000)],
    "IE": [("Dublin", 53.3498, -6.2603, 9000), ("Cork", 51.8985, -8.4756, 5000),
           ("Galway", 53.2707, -9.0568, 5000), ("Limerick", 52.6638, -8.6267, 5000)],
    "BE": [("Bruxelles", 50.8503, 4.3517, 9000), ("Anvers", 51.2194, 4.4025, 7000),
           ("Gand", 51.0543, 3.7174, 6000), ("Liege", 50.6326, 5.5797, 6000),
           ("Charleroi", 50.4108, 4.4446, 5000), ("Namur", 50.4674, 4.8720, 5000)],
    "LU": [("Luxembourg", 49.6116, 6.1319, 8000), ("Esch-sur-Alzette", 49.4958, 5.9806, 5000)],
    "NL": [("Amsterdam", 52.3676, 4.9041, 9000), ("Rotterdam", 51.9244, 4.4777, 8000),
           ("La Haye", 52.0705, 4.3007, 7000), ("Utrecht", 52.0907, 5.1214, 6000),
           ("Eindhoven", 51.4416, 5.4697, 6000)],
    "PT": [("Lisbonne", 38.7223, -9.1393, 8000), ("Porto", 41.1579, -8.6291, 7000),
           ("Braga", 41.5454, -8.4265, 5000), ("Coimbra", 40.2033, -8.4103, 5000)],
    "CH": [("Zurich", 47.3769, 8.5417, 7000), ("Geneve", 46.2044, 6.1432, 6000),
           ("Bale", 47.5596, 7.5886, 6000), ("Lausanne", 46.5197, 6.6323, 6000),
           ("Berne", 46.9480, 7.4474, 6000)],
    "US": [("New York", 40.7128, -74.0060, 12000), ("Los Angeles", 34.0522, -118.2437, 15000),
           ("Chicago", 41.8781, -87.6298, 12000), ("Houston", 29.7604, -95.3698, 14000),
           ("Miami", 25.7617, -80.1918, 10000), ("Boston", 42.3601, -71.0589, 8000)],
    "MX": [("Mexico", 19.4326, -99.1332, 12000), ("Guadalajara", 20.6597, -103.3496, 9000),
           ("Monterrey", 25.6866, -100.3161, 9000), ("Puebla", 19.0414, -98.2063, 7000)],
    "AR": [("Buenos Aires", -34.6037, -58.3816, 11000), ("Cordoba", -31.4201, -64.1888, 8000),
           ("Rosario", -32.9442, -60.6505, 7000), ("Mendoza", -32.8895, -68.8458, 6000)],
    "CL": [("Santiago", -33.4489, -70.6693, 11000), ("Valparaiso", -33.0472, -71.6127, 7000),
           ("Concepcion", -36.8201, -73.0444, 6000), ("Vina del Mar", -33.0153, -71.5500, 5000)],
    "FR": [("Paris", 48.8566, 2.3522, 10000), ("Lyon", 45.7640, 4.8357, 8000),
           ("Marseille", 43.2965, 5.3698, 9000), ("Toulouse", 43.6047, 1.4442, 8000)],
}

# Les metiers vises, exprimes en balises OpenStreetMap, avec ce qu'on peut leur
# proposer. Le libelle de proposition n'est pas decoratif : c'est lui qui
# nourrit la colonne du meme nom, et donc ce qu'Adam a sous les yeux au moment
# d'ecrire. Il nomme un manque precis, pas une prestation generique.
METIERS: dict[str, tuple[str, str, str]] = {
    "restauration": (
        'nwr["amenity"~"^(restaurant|cafe|bar)$"]',
        "Restauration",
        "Reservation en ligne, carte a jour sans repasser par un prestataire, "
        "et empreinte bancaire sur les grandes tablees pour que le desistement "
        "coute a celui qui l'inflige.",
    ),
    "coiffure-esthetique": (
        'nwr["shop"~"^(hairdresser|beauty)$"]',
        "Coiffure et esthetique",
        "Prise de rendez-vous en ligne et rappel automatique, pour que le "
        "telephone cesse de sonner pendant les prestations.",
    ),
    "bien-etre": (
        'nwr["shop"="massage"]',
        "Praticiens du bien-etre",
        "Prise de rendez-vous avec gestion des creneaux, rappel la veille et "
        "remise en ligne immediate du creneau libere. Exactement ce qui a ete "
        "livre et mesure pour un cabinet d'hypnose.",
    ),
    "batiment": (
        'nwr["craft"~"^(builder|carpenter|electrician|plumber|painter|roofer)$"]',
        "Artisans du batiment",
        "Formulaire de devis structure - type de travaux, adresse, photo, "
        "delai - qui qualifie avant l'appel et supprime les deplacements de "
        "chiffrage inutiles.",
    ),
    "immobilier": (
        'nwr["office"="estate_agent"]',
        "Agences immobilieres",
        "Portail de biens a jour, prise de rendez-vous de visite, et espace "
        "proprietaire pour les documents recurrents.",
    ),
    "formation": (
        'nwr["amenity"="driving_school"];nwr["office"="educational_institution"]',
        "Formation",
        "Inscriptions en ligne avec paiement, plannings et documents a "
        "telecharger, au lieu d'un echange de courriels par eleve.",
    ),
}


class OverpassIndisponible(Exception):
    """Overpass a refuse ou n'a pas repondu.

    Distincte d'un resultat vide, pour la meme raison que dans le collecteur
    francais : un service surcharge et une ville sans commerces ne sont pas la
    meme nouvelle, et rien ne les distinguerait sans cette exception.
    """


def interroge(requete: str) -> dict:
    """Interroge Overpass, en changeant d'instance plutot qu'en insistant.

    429 « trop de requetes » et 504 « aucun creneau » sont les deux refus
    normaux du service sous charge. Reessayer la meme instance plus fort est
    exactement ce qui la fait basculer d'un ralentissement a un blocage : on
    passe donc au miroir suivant, et on ne revient sur le premier qu'au tour
    d'apres, apres une attente franche.
    """
    donnees = urllib.parse.urlencode({"data": requete}).encode("utf-8")
    dernier = "aucune tentative"
    for tour in range(2):
        for miroir in MIROIRS:
            demande = urllib.request.Request(
                miroir, data=donnees, method="POST",
                headers={"User-Agent":
                         "blf-labs-prospection/1.0 (contact@beloucif.com)"})
            try:
                with urllib.request.urlopen(demande, timeout=180) as reponse:
                    return json.load(reponse)
            except urllib.error.HTTPError as err:
                dernier = "HTTP {} sur {}".format(
                    err.code, urllib.parse.urlsplit(miroir).netloc)
            except Exception as err:
                dernier = "{} sur {}".format(
                    err, urllib.parse.urlsplit(miroir).netloc)
        if tour == 0:
            time.sleep(45)
    raise OverpassIndisponible(dernier)


def _requete(selecteur: str, lat: float, lon: float, rayon: int, plafond: int) -> str:
    """Construit la requete Overpass.

    `[website]` est exige des la requete, et c'est ce qui rend la collecte
    utilisable : sans site, il n'y a aucune page ou lire une adresse, et la
    fiche ne pourrait jamais devenir un contact. Filtrer cote serveur evite
    aussi de faire transiter dix fois le volume utile.
    """
    corps = ";".join(
        "{}[website](around:{},{},{})".format(s, rayon, lat, lon)
        for s in selecteur.split(";") if s.strip()
    )
    return "[out:json][timeout:150];({};);out center {};".format(corps, plafond)


def collecte(pays: str, villes: int, metiers: list[str], plafond: int,
             sortie: str) -> list[dict]:
    if pays not in PAYS_OUVERTS:
        raise SystemExit(
            "Pays « {} » refuse. Soit il exige un consentement prealable - "
            "Allemagne, Autriche, Espagne, Italie, Canada -, soit son regime "
            "n'a pas ete etabli. Collecter ce qu'on n'a pas le droit "
            "d'utiliser ne sert a rien.".format(pays))

    zones = VILLES[pays][:villes]
    lignes: list[dict] = []
    vus: set[str] = set()
    echecs = 0
    taches = [(z, m) for z in zones for m in metiers]

    for n, ((ville, lat, lon, rayon), metier) in enumerate(taches, 1):
        selecteur, libelle, proposition = METIERS[metier]
        print("  {}/{}  {} - {}".format(n, len(taches), ville, libelle),
              file=sys.stderr)
        try:
            data = interroge(_requete(selecteur, lat, lon, rayon, plafond))
        except OverpassIndisponible as err:
            print("    ! {}".format(err), file=sys.stderr)
            echecs += 1
            time.sleep(PAUSE)
            continue

        for e in data.get("elements") or []:
            balises = e.get("tags") or {}
            site = (balises.get("website") or "").strip()
            nom = (balises.get("name") or "").strip()
            if not site or not nom:
                continue
            # Le domaine sert de cle de dedoublonnage : une enseigne cartographiee
            # en plusieurs points rendrait autant de fiches pour un seul site, et
            # on ecrirait quatre fois a la meme boite.
            domaine = urllib.parse.urlsplit(
                site if "//" in site else "http://" + site).netloc.lower()
            domaine = domaine[4:] if domaine.startswith("www.") else domaine
            if not domaine or domaine in vus:
                continue
            vus.add(domaine)
            lignes.append({
                "siren": "",
                "pays": pays,
                "organisation": nom,
                "secteur": libelle,
                "naf": "",
                "commune": balises.get("addr:city") or ville,
                "code_postal": balises.get("addr:postcode") or "",
                "adresse": " ".join(filter(None, [
                    balises.get("addr:housenumber") or "",
                    balises.get("addr:street") or "",
                ])).strip(),
                "date_creation": "",
                "effectif": "",
                "nature_juridique": "",
                "statut_diffusion": "",
                "site_web": site,
                "a_deja_un_site": "oui",
                "proposition": proposition,
                "email_generique": "",
                "statut": "",
                "note": "",
                # L'origine exacte, telle qu'elle sera dite dans le premier
                # message. C'est OpenStreetMap qui a designe le SITE ; l'adresse,
                # elle, sera lue sur ce site par `verifier`.
                "source": "openstreetmap.org (site), puis adresse lue sur le site",
            })

        # Ecriture au fil de l'eau. Une collecte sur six villes et six metiers
        # tient plus d'une demi-heure a cette cadence : ne rien materialiser
        # avant la derniere ligne transformerait la moindre coupure en perte
        # totale, lecon deja payee sur l'annuaire francais.
        if sortie and lignes:
            ecris(sortie, lignes)
        time.sleep(PAUSE)

    if echecs == len(taches) and not lignes:
        raise OverpassIndisponible(
            "toutes les requetes ont echoue : c'est le service, pas le marche")

    return lignes


def main() -> int:
    p = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--pays", required=True,
                   help="codes ISO separes par des virgules, ex GB,IE,BE. "
                        "Seuls les pays ou le courriel professionnel est admis "
                        "sans consentement prealable sont acceptes.")
    p.add_argument("--villes", type=int, default=4,
                   help="nombre de villes par pays, de la plus grande a la plus petite")
    p.add_argument("--metiers", default=",".join(sorted(METIERS)),
                   help="metiers vises, separes par des virgules")
    p.add_argument("--par-requete", type=int, default=400,
                   help="fiches maximum par couple ville-metier")
    p.add_argument("--sortie", required=True, help="CSV a ecrire, HORS du depot")
    a = p.parse_args()

    if refuse_le_depot(a.sortie):
        print("Refus : la sortie porte des donnees relatives a des personnes "
              "et ne doit pas etre ecrite dans le depot.", file=sys.stderr)
        return 2

    metiers = [m.strip() for m in a.metiers.split(",") if m.strip()]
    inconnus = [m for m in metiers if m not in METIERS]
    if inconnus:
        print("Metiers inconnus : {}. Connus : {}".format(
            ", ".join(inconnus), ", ".join(sorted(METIERS))), file=sys.stderr)
        return 2

    toutes: list[dict] = []
    domaines: set[str] = set()
    for pays in [c.strip().upper() for c in a.pays.split(",") if c.strip()]:
        print("=== {} ({})".format(PAYS_OUVERTS.get(pays, pays), pays), file=sys.stderr)
        try:
            lignes = collecte(pays, a.villes, metiers, a.par_requete, a.sortie + ".part")
        except OverpassIndisponible as err:
            print("Overpass indisponible : {}. Rien n'a ete ecrit pour ce "
                  "pays.".format(err), file=sys.stderr)
            continue
        # Dedoublonnage entre pays : une enseigne frontaliere peut sortir deux
        # fois, et le meme site ne doit recevoir qu'un message.
        for l in lignes:
            cle = l["site_web"].lower()
            if cle in domaines:
                continue
            domaines.add(cle)
            toutes.append(l)
        print("  {} fiches cumulees".format(len(toutes)), file=sys.stderr)

    if not toutes:
        print("Aucun resultat.", file=sys.stderr)
        return 1

    ecris(a.sortie, toutes)
    if os.path.exists(a.sortie + ".part"):
        os.remove(a.sortie + ".part")
    print("\n{} structures ecrites dans {}".format(len(toutes), a.sortie),
          file=sys.stderr)
    print("Aucune adresse email : OpenStreetMap a donne le SITE, pas l'adresse. "
          "Elle se lit sur le site, par :", file=sys.stderr)
    print("  python scripts/prospection.py verifier --fichier {}".format(a.sortie),
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
