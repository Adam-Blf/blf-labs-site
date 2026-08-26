"""Outil de prospection : chercher, qualifier, exporter, importer.

Quatre sous-commandes, dans l'ordre ou on s'en sert :

    python scripts/prospection.py chercher --departements 94,92 --sortie base.csv
    python scripts/prospection.py verifier --fichier base.csv
    python scripts/prospection.py exporter --fichier base.csv --sortie liste.xlsx
    python scripts/prospection.py importer --fichier base.csv

CE QUE CET OUTIL N'ENVOIE PAS, ET POURQUOI.

Il n'expedie aucun message. Le moteur d'envoi existe deja dans le site :
sequences en TypeScript, double opt-in, liste de suppression, desinscription en
un clic (RFC 8058), battement par GitHub Actions, purge a trois ans. Ecrire un
second chemin d'envoi ici reviendrait a contourner toutes ces gardes, et c'est
exactement comme ca qu'on se retrouve a ecrire a quelqu'un qui s'est desinscrit.

La sous-commande `importer` alimente donc la table `contacts`, et c'est le
moteur du site qui envoie, avec ses regles.

SOURCE. API Recherche d'entreprises (recherche-entreprises.api.gouv.fr),
service public gratuit, sans cle, adossee aux bases Sirene et RNE. Elle ne
publie AUCUNE adresse email.

CE QUE LE FILTRE ECARTE.

Les unites opposees a la diffusion de leurs donnees Sirene. C'est le seul droit
d'opposition DEJA EXERCE dans ce perimetre, par plus d'un million
d'etablissements, et le respecter passe avant tout le reste. Piege de valeur :
il n'existe plus de statut `N`, tout est passe en `P`, donc le test est `= 'O'`
et jamais `<> 'N'`.

Les entrepreneurs individuels, PAR DEFAUT et par prudence. Ce n'est pas une
obligation : la CNIL admet l'interet legitime des lors que l'objet du message
est en rapport avec la profession du destinataire. Mais sa derogation explicite
ne vise que les personnes MORALES. L'option --inclure-entreprises-individuelles
leve l'exclusion en connaissance de cause.

Les structures de 20 salaries et plus : elles ont deja un prestataire.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import concurrent.futures
import threading
import urllib.request

API = "https://recherche-entreprises.api.gouv.fr/search"
PAUSE = 1.0
DIFFUSIBLE = "O"
NATURE_PERSONNE_PHYSIQUE = "1000"

# Sections d'activite ou un site sert reellement a vendre, avec ce qu'on peut
# proposer concretement. Le libelle de proposition sert a preparer un message :
# il nomme un manque precis, pas une prestation generique.
SECTIONS = {
    "I": (
        "Hebergement et restauration",
        "Reservation en ligne, carte a jour sans repasser par un prestataire, "
        "et empreinte bancaire sur les grandes tablees pour que le desistement "
        "coute a celui qui l'inflige.",
    ),
    "F": (
        "Construction",
        "Formulaire de devis structure - type de travaux, adresse, photo, "
        "delai - qui qualifie avant l'appel et supprime les deplacements de "
        "chiffrage inutiles. La demande arrive le soir, quand vous etes "
        "joignable, pas pendant le chantier.",
    ),
    "G": (
        "Commerce et reparation",
        "Vitrine avec horaires justes, catalogue consultable et demande de "
        "reservation d'article. Ce qui arrive hors des heures d'ouverture "
        "cesse d'etre perdu.",
    ),
    "Q": (
        "Sante humaine et action sociale",
        "Prise de rendez-vous avec gestion des creneaux, rappel automatique la "
        "veille et remise en ligne immediate du creneau libere. Complement "
        "d'un annuaire, pas remplacement : un site sert ceux qui vous "
        "connaissent deja.",
    ),
    "S": (
        "Autres services (coiffure, esthetique, reparation)",
        "Prise de rendez-vous en ligne et rappel automatique, pour que le "
        "telephone cesse de sonner pendant les prestations.",
    ),
    "P": (
        "Enseignement",
        "Inscriptions en ligne avec paiement, plannings et documents a "
        "telecharger, au lieu d'un echange de courriels par famille.",
    ),
    "R": (
        "Arts, spectacles et loisirs",
        "Planning des seances, inscriptions et paiement en ligne, billetterie "
        "simple pour les evenements.",
    ),
    "M": (
        "Activites specialisees, scientifiques et techniques",
        "Presentation des references et demande de contact qualifiee, pour "
        "trier les demandes avant le premier appel.",
    ),
    "C": (
        "Industrie et fabrication",
        "Catalogue produit consultable, fiches techniques telechargeables et "
        "demande de devis structuree. Un acheteur qui doit telephoner pour "
        "obtenir une fiche technique appelle le concurrent qui l'a en ligne.",
    ),
    "N": (
        "Services administratifs et de soutien",
        "Presentation claire des prestations, demande de devis qualifiee et "
        "espace client pour suivre les interventions, au lieu d'un echange de "
        "courriels qui se perd.",
    ),
    "L": (
        "Immobilier",
        "Annonces a jour avec photos, demande de visite en ligne et estimation "
        "en quelques questions. Le prospect qui cherche a 22 h ne rappelle pas "
        "le lendemain.",
    ),
    "H": (
        "Transports et entreposage",
        "Demande de devis avec volume, adresses et date, calculee avant "
        "l'appel. Suivi de commande accessible au client sans passer par le "
        "standard.",
    ),
}

# Requetes qui ramenent les associations etudiantes. Plusieurs formulations
# coexistent selon les ecoles, et aucune ne les attrape toutes : « bureau des
# eleves » domine dans les ecoles d'ingenieurs, « bureau des etudiants » dans
# les universites et les ecoles de commerce.
REQUETES_BDE = [
    "bureau des etudiants",
    "bureau des eleves",
    "BDE",
    "bureau des etudiants ecole",
    "association etudiante",
]

PROPOSITION_BDE = (
    "Billetterie en ligne pour les soirees et les week-ends d'integration, "
    "avec paiement et liste d'emargement a l'entree. Adhesions de l'annee "
    "payees en ligne au lieu du liquide et du tableur. Un site qui survit au "
    "changement de bureau, contrairement a un compte Instagram dont personne "
    "ne retrouve le mot de passe en septembre."
)

# Mots trop generiques pour fonder une devinette de domaine. Sans cette liste,
# « UNION NATIONALE COMBATTANTS » donnait union.fr et « SOC EXPL DES ETS
# C THOREAU » donnait soc.fr : des domaines appartenant a des tiers.
MOTS_VIDES = {
    "sarl", "sas", "sasu", "eurl", "sci", "snc", "selarl", "selas", "scop",
    "societe", "les", "des", "du", "de", "la", "le", "et", "aux", "pour",
    "ile", "france", "national", "nationale", "union", "cabinet", "soc",
    "expl", "ets", "association", "groupe", "entreprise", "compagnie",
    "generale", "general", "nouvelle", "nouveau", "saint", "sainte",
}

COLONNES = [
    "siren", "organisation", "secteur", "naf", "commune", "code_postal",
    "adresse", "date_creation", "effectif", "nature_juridique",
    "statut_diffusion", "site_web", "a_deja_un_site", "proposition",
    "email_generique", "statut", "note", "source",
]


# --------------------------------------------------------------------------
# chercher
# --------------------------------------------------------------------------

def interroge(params: dict, essais: int = 3) -> dict:
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
        except Exception as err:
            if tentative < essais - 1:
                time.sleep(1.5 * (tentative + 1))
                continue
            return {"_erreur": str(err)}
    return {"_erreur": "epuise"}


# Les 101 departements. La Corse porte 2A et 2B et non 20, et les cinq
# departements d'outre-mer ont un code a trois chiffres : une simple boucle de
# 1 a 95 en manque sept, dont la Reunion et la Martinique.
DEPARTEMENTS = (
    ["{:02d}".format(i) for i in range(1, 20)]
    + ["2A", "2B"]
    + ["{:02d}".format(i) for i in range(21, 96)]
    + ["971", "972", "973", "974", "976"]
)


class Cadence:
    """Limiteur de debit partage entre les fils.

    L'API Recherche d'entreprises est un service public gratuit, sans cle, et
    sa limite documentee est de 7 appels par seconde. On se tient volontairement
    en dessous : un outil de prospection qui fait tomber l'annuaire public prive
    tout le monde de la donnee, y compris nous.
    """

    def __init__(self, par_seconde: float) -> None:
        self._intervalle = 1.0 / par_seconde
        self._verrou = threading.Lock()
        self._prochain = 0.0

    def attends(self) -> None:
        with self._verrou:
            maintenant = time.monotonic()
            if self._prochain > maintenant:
                time.sleep(self._prochain - maintenant)
                maintenant = time.monotonic()
            self._prochain = maintenant + self._intervalle


# Niches nommees, avec les codes NAF qui les delimitent VRAIMENT.
#
# POURQUOI CES CODES ET PAS LES SECTIONS.
#
# Une section d'activite est trop large pour preparer un message. La section Q,
# « Sante humaine et action sociale », contient l'hopital, l'EHPAD, l'infirmier
# liberal et le sophrologue : quatre metiers qui n'achetent pas la meme chose,
# et dont trois n'achetent rien a un studio de deux personnes. Le code NAF
# descend au metier, ce qui est le niveau ou un message cesse d'etre generique.
NICHES = {
    "bien-etre": (
        "Praticiens du bien-etre et therapies",
        "8690F,8690E,8690D",
        "Prise de rendez-vous avec gestion des creneaux, rappel automatique la "
        "veille et remise en ligne immediate du creneau libere. Exactement ce "
        "qui a ete livre et mesure pour un cabinet d'hypnose.",
    ),
    "coiffure-esthetique": (
        "Coiffure et esthetique",
        "9602A,9602B",
        "Prise de rendez-vous en ligne et rappel automatique, pour que le "
        "telephone cesse de sonner pendant les prestations.",
    ),
    "batiment": (
        "Artisans du batiment",
        "4322A,4322B,4321A,4399C,4332A,4334Z,4391B",
        "Formulaire de devis structure - type de travaux, adresse, photo, "
        "delai - qui qualifie avant l'appel et supprime les deplacements de "
        "chiffrage inutiles.",
    ),
    "formation": (
        "Organismes de formation et enseignement prive",
        "8559A,8559B,8551Z,8552Z,8553Z",
        "Inscriptions en ligne avec paiement, plannings et documents a "
        "telecharger, au lieu d'un echange de courriels par famille.",
    ),
    "restauration": (
        "Restauration",
        "5610A,5610C,5630Z",
        "Reservation en ligne, carte a jour sans repasser par un prestataire, "
        "et empreinte bancaire sur les grandes tablees.",
    ),
    "immobilier": (
        "Agences immobilieres et syndics",
        "6831Z,6832A,6832B",
        "Portail de biens a jour, prise de rendez-vous de visite, et espace "
        "proprietaire pour les documents recurrents.",
    ),
}


def _perimetres(perimetre: dict) -> list[dict]:
    """Decoupe le perimetre demande en requetes qui tiennent dans l'API.

    POURQUOI CE DECOUPAGE EXISTE.

    La pagination de l'API s'arrete a la page 400, soit 10 000 fiches par
    REQUETE. Une recherche nationale sur une section d'activite bute donc a
    10 000, et rien ne le signale : on recoit un fichier plein, simplement
    tronque. Neuf sections plafonnaient ainsi le gisement national a 90 000,
    et la version precedente s'arretait bien plus tot encore.

    Partitionner par departement supprime le mur : chaque couple
    departement-section a son propre budget de 10 000, et les departements
    sont disjoints, donc aucune fiche n'est comptee deux fois pour cette
    raison. Le dedoublonnage sur le SIREN reste en place pour les autres.
    """
    if perimetre.get("departement"):
        return [{"departement": d.strip()}
                for d in perimetre["departement"].split(",") if d.strip()]
    if perimetre.get("region"):
        # Une region ne se decoupe pas ici : l'API n'accepte pas les deux
        # criteres ensemble, et une region depasse rarement le plafond.
        return [perimetre]
    return [{"departement": d} for d in DEPARTEMENTS]


def cherche(perimetre: dict, par_section: int, inclure_ei: bool,
            parallele: int = 5, sortie: str = "",
            niche: str = "") -> list[dict]:
    """Interroge l'annuaire public, un couple departement-section a la fois.

    `par_section` s'entend PAR DEPARTEMENT quand le perimetre en couvre
    plusieurs. C'est ce qui permet d'annoncer un volume atteignable : 120 par
    section et par departement font 101 x 9 x 120, soit environ 109 000 fiches
    avant dedoublonnage, la ou l'ancien plafond global rendait 300 par section.
    """
    zones = _perimetres(perimetre)
    if niche:
        libelle, codes, proposition = NICHES[niche]
        cibles = {c: (libelle, proposition) for c in codes.split(",")}
        cle_api = "activite_principale"
    else:
        cibles = SECTIONS
        cle_api = "section_activite_principale"
    taches = [(z, c) for z in zones for c in cibles]
    # DEUX par seconde, pas cinq. La limite documentee est de sept, et cinq
    # paraissait donc prudent : un tir soutenu de quarante-cinq minutes a
    # pourtant fini par se faire fermer la connexion par l'hote. Une limite
    # affichee vaut par requete instantanee, pas par heure de martelement, et
    # ce service est gratuit, public, et utilise par d'autres.
    cadence = Cadence(par_seconde=2.0)
    verrou = threading.Lock()
    vus: set[str] = set()
    lignes: list[dict] = []
    faits = [0]

    def une_tache(zone_section) -> None:
        zone, section = zone_section
        libelle, proposition = cibles[section]
        page, pris, recolte = 1, 0, []

        while pris < par_section:
            cadence.attends()
            data = interroge({
                **zone,
                cle_api: section,
                "etat_administratif": "A",
                "tranche_effectif_salarie": "01,02,03,11",
                "per_page": 25,
                "page": page,
            })
            if "_erreur" in data:
                print("  ! {} section {} : {}".format(
                    zone.get("departement") or zone.get("region"), section,
                    data["_erreur"]), file=sys.stderr)
                break
            resultats = data.get("results") or []
            if not resultats:
                break

            for e in resultats:
                siren = e.get("siren")
                if not siren:
                    continue
                if (not inclure_ei
                        and e.get("nature_juridique") == NATURE_PERSONNE_PHYSIQUE):
                    continue
                if e.get("statut_diffusion") != DIFFUSIBLE:
                    continue
                siege = e.get("siege") or {}
                if siege.get("statut_diffusion_etablissement") != DIFFUSIBLE:
                    continue
                recolte.append({
                    "siren": siren,
                    "organisation": e.get("nom_complet") or "",
                    "secteur": libelle,
                    "naf": e.get("activite_principale") or "",
                    "commune": siege.get("libelle_commune") or "",
                    "code_postal": siege.get("code_postal") or "",
                    "adresse": siege.get("adresse") or "",
                    "date_creation": e.get("date_creation") or "",
                    "effectif": e.get("tranche_effectif_salarie") or "",
                    "nature_juridique": e.get("nature_juridique") or "",
                    "statut_diffusion": e.get("statut_diffusion") or "",
                    "site_web": "",
                    "a_deja_un_site": "",
                    "proposition": proposition,
                    "email_generique": "",
                    "statut": "",
                    "note": "",
                    "source": "annuaire-entreprises.data.gouv.fr",
                })
                pris += 1
                if pris >= par_section:
                    break

            if page * 25 >= data.get("total_results", 0):
                break
            # La pagination de l'API s'arrete la. Continuer rendrait une erreur,
            # pas une page vide : sans cette borne, chaque couple sature en
            # renvoyant une erreur au lieu de passer au suivant.
            if page >= 400:
                break
            page += 1

        # Le dedoublonnage se fait au moment du versement, pas pendant la
        # recolte : garder le verrou le temps d'une requete reseau serialiserait
        # tous les fils et annulerait le parallelisme.
        with verrou:
            for ligne in recolte:
                if ligne["siren"] in vus:
                    continue
                vus.add(ligne["siren"])
                lignes.append(ligne)
            faits[0] += 1
            # ECRITURE AU FIL DE L'EAU, et ce n'est pas un confort.
            #
            # La version precedente n'ecrivait qu'a la toute fin. Une recherche
            # nationale de quarante-cinq minutes s'est fait fermer la connexion
            # par l'API et a ete arretee : tout le travail deja fait est parti
            # avec, alors qu'il etait en memoire, complet et utilisable.
            #
            # Un traitement long qui ne materialise rien avant sa derniere
            # ligne transforme n'importe quel incident en perte totale.
            if sortie and (faits[0] % 25 == 0 or faits[0] == len(taches)):
                ecris(sortie, lignes)
            if faits[0] % 25 == 0 or faits[0] == len(taches):
                print("  {}/{} requetes, {} structures{}".format(
                    faits[0], len(taches), len(lignes),
                    " (ecrites)" if sortie else ""), file=sys.stderr)

    with concurrent.futures.ThreadPoolExecutor(max_workers=parallele) as pool:
        list(pool.map(une_tache, taches))

    return lignes


def cherche_bde(perimetre: dict, par_requete: int, inclure_ei: bool) -> list[dict]:
    """Cherche les associations etudiantes.

    Le filtre `est_association` est indispensable : « BDE » seul ramene des
    societes commerciales qui portent ces trois lettres pour tout autre motif.
    Avec le filtre, on passe de 1 173 resultats bruts a 1 053 associations.

    Une association est une PERSONNE MORALE : le regime d'opposition s'applique
    a son adresse generique, comme pour une societe.
    """
    lignes: list[dict] = []
    vus: set[str] = set()

    for requete in REQUETES_BDE:
        page, pris = 1, 0
        while pris < par_requete:
            data = interroge({
                **perimetre,
                "q": requete,
                "est_association": "true",
                "etat_administratif": "A",
                "per_page": 25,
                "page": page,
            })
            if "_erreur" in data:
                print("  ! {} : {}".format(requete, data["_erreur"]), file=sys.stderr)
                break
            resultats = data.get("results") or []
            if not resultats:
                break

            for e in resultats:
                siren = e.get("siren")
                if not siren or siren in vus:
                    continue
                if (not inclure_ei
                        and e.get("nature_juridique") == NATURE_PERSONNE_PHYSIQUE):
                    continue
                siege = e.get("siege") or {}
                if e.get("statut_diffusion") != DIFFUSIBLE:
                    continue
                if siege.get("statut_diffusion_etablissement") != DIFFUSIBLE:
                    continue
                complements = e.get("complements") or {}
                vus.add(siren)
                lignes.append({
                    "siren": siren,
                    "organisation": e.get("nom_complet") or "",
                    "secteur": "Association etudiante",
                    "naf": e.get("activite_principale") or "",
                    "commune": siege.get("libelle_commune") or "",
                    "code_postal": siege.get("code_postal") or "",
                    "adresse": siege.get("adresse") or "",
                    "date_creation": e.get("date_creation") or "",
                    "effectif": e.get("tranche_effectif_salarie") or "",
                    "nature_juridique": e.get("nature_juridique") or "",
                    "statut_diffusion": e.get("statut_diffusion") or "",
                    "site_web": "",
                    "a_deja_un_site": "",
                    "proposition": PROPOSITION_BDE,
                    "email_generique": "",
                    "statut": "",
                    "note": "RNA {}".format(complements.get("identifiant_association") or "non publie"),
                    "source": "annuaire-entreprises.data.gouv.fr",
                })
                pris += 1
                if pris >= par_requete:
                    break

            if page * 25 >= data.get("total_results", 0):
                break
            page += 1
            time.sleep(PAUSE)

        print("  {:28} cumul {}".format(requete, len(lignes)), file=sys.stderr)
        time.sleep(PAUSE)

    return lignes


# --------------------------------------------------------------------------
# verifier
# --------------------------------------------------------------------------

def jetons(nom: str) -> list[str]:
    """Mots distinctifs d'un nom, DEDOUBLONNES et dans l'ordre.

    Le dedoublonnage n'est pas cosmetique. L'annuaire rend souvent le nom
    legal suivi du nom d'usage entre parentheses - « GO SPORT FRANCE (GO
    SPORT) », « NELL KA (NELL KA) » - et sans lui les devinettes produisaient
    `sportsport.com` et `nellnell.com`, des domaines qui n'existent pour
    personne quand ils ne sont pas pris par un tiers.
    """
    n = re.sub(r"[^a-z0-9 ]", " ", nom.lower())
    out: list[str] = []
    for m in n.split():
        if len(m) > 2 and m not in MOTS_VIDES and m not in out:
            out.append(m)
    return out


# Mots de METIER, trop courants pour fonder a eux seuls une devinette de
# domaine. `plomberie.fr` ou `boulangerie.com` existent et appartiennent a des
# tiers : les essayer seuls ne coute pas seulement des requetes inutiles, ca
# fabrique un faux positif qui marque un vrai prospect comme deja equipe et le
# SORT de la liste. C'est la pire des deux erreurs, et elle est silencieuse.
#
# Ils restent parfaitement valables COMBINES a un autre mot :
# `plomberie-martin.fr` est une devinette raisonnable.
MOTS_TROP_COURANTS = {
    "plomberie", "boulangerie", "patisserie", "boucherie", "charcuterie",
    "coiffure", "esthetique", "restaurant", "brasserie", "pizzeria", "hotel",
    "garage", "auto", "automobile", "taxi", "transport", "transports",
    "batiment", "construction", "renovation", "menuiserie", "electricite",
    "peinture", "maconnerie", "couverture", "chauffage", "isolation",
    "immobilier", "agence", "conseil", "services", "service", "solutions",
    "consulting", "formation", "developpement", "distribution", "commerce",
    "medical", "sante", "pharmacie", "optique", "dentaire", "veterinaire",
    "creche", "ecole", "college", "lycee", "sport", "fitness", "danse",
    "studio", "atelier", "boutique", "magasin", "epicerie", "primeur",
    "fleuriste", "jardin", "paysage", "nettoyage", "proprete", "securite",
    "informatique", "digital", "numerique", "web", "communication",
    "bistrot", "cafe", "bar", "traiteur", "institut", "clinique", "centre",
}


def candidats(nom: str) -> list[str]:
    """Devine les domaines possibles d'une structure a partir de son nom.

    CE QUI A CHANGE, ET POURQUOI.

    La version precedente ne tentait que le nom COMPLET, accole puis trait
    d'union, en .fr et .com : quatre devinettes. Mesure sur 360 structures du
    Val-de-Marne, elle confirmait 107 sites, soit 30 %.

    Le defaut se voit sur un exemple. Pour « BOULANGERIE PATISSERIE LEDUC »
    elle essayait `boulangeriepatisserieleduc.fr`, un domaine que personne
    n'achete. Les vrais candidats sont `boulangerie-leduc.fr` et `leduc.fr` :
    le nom LEGAL est plus long que le nom d'usage, et c'est le cas courant.

    D'ou trois familles en plus - premier avec dernier mot, deux premiers mots,
    un mot distinctif seul - ET UN ORDRE. L'ordre compte autant que les
    familles : un premier elargissement les avait ajoutees en queue, le
    plafond etait mange par les variantes longues, et `leduc` n'etait jamais
    tente. Une famille qu'on n'atteint pas ne sert a rien.

    CE QUI REND CET ELARGISSEMENT SUR : la page trouvee est ensuite confirmee
    par `parle_de()`, qui exige qu'elle mentionne la structure. Un mot de
    metier seul reste malgre tout ecarte d'avance, et un nom qui se REDUIT a
    un mot de metier ne produit aucune devinette du tout - `plomberie.fr`
    appartient a quelqu'un, et le faux positif sortirait un vrai prospect de
    la liste.
    """
    m = jetons(nom)
    if not m:
        return []

    def utilisable_seul(mot: str) -> bool:
        # SEPT lettres, et non cinq. Le seuil a cinq a ete mesure : il a
        # ramene la mairie de Lille pour « LILLE DEVELOPPEMENT SAS », le
        # tourisme champenois pour « MIROITERIE DU VAL DE MARNE », et le meme
        # `sushi.fr` pour quatre restaurants differents. Tous les faux positifs
        # de ce releve reposaient sur un mot de cinq lettres : lille, marne,
        # sushi, shiva, logic, datex, chick, blanc, eeudf.
        #
        # Un mot court est presque toujours un lieu, un mot courant ou un
        # sigle, donc un domaine deja pris par un tiers. Et le faux positif est
        # la pire des deux erreurs : il marque un vrai prospect comme deja
        # equipe et le SORT de la liste, en silence.
        return len(mot) >= 7 and mot not in MOTS_TROP_COURANTS

    # Par vraisemblance decroissante. Le nom complet reste en tete parce qu'il
    # est juste chaque fois que le nom legal EST le nom d'usage, ce qui reste
    # le cas le plus frequent pris isolement.
    familles: list[list[str]] = [m]
    if len(m) >= 3:
        familles.append([m[0], m[-1]])
        familles.append(m[:2])
    # PAS DE FAMILLE A UN SEUL MOT, et c'est une decision mesuree.
    #
    # Elle a ete essayee, avec un seuil a cinq lettres puis a sept, et les deux
    # fois le releve manuel a montre qu'elle rapportait surtout du faux :
    # `miroiterie.fr` pour « MIROITERIE DU VAL DE MARNE », `imagerie.fr` pour
    # « IMAGERIE MEDICALE CMSM », `sebastien.fr` pour « PASCAL SEBASTIEN ».
    # Aucune liste de mots interdits ne rattrape ca : le probleme n'est pas que
    # ces mots soient courants, c'est qu'un domaine d'un seul mot appartient
    # presque toujours a quelqu'un d'autre.
    #
    # Les familles a DEUX mots, elles, tiennent : `eiffelmetallerie.fr`,
    # `maisons-cbi.fr`, `alliancepvc.fr`, `lamn-sushi.fr` sont tous justes.
    # C'est la combinaison qui distingue, pas la longueur.

    bases: list[str] = []
    for mots in familles:
        # Un nom qui se reduit a un seul mot de metier ne fonde rien, meme
        # arrive ici par la famille du nom complet.
        if len(mots) == 1 and not utilisable_seul(mots[0]):
            continue
        for assemble in ("".join(mots), "-".join(mots)):
            b = assemble[:30]
            if len(b) >= 5 and b not in bases:
                bases.append(b)

    # TOUS les .fr d'abord, les .com ensuite. Parcourir domaine par domaine
    # semblait naturel et coutait la famille la plus utile : sur
    # « BOULANGERIE PATISSERIE LEDUC », les variantes longues consommaient les
    # dix places en .fr ET en .com, et `leduc.fr` - la devinette la plus
    # plausible de toutes - tombait juste apres la coupe. Un TPE francais est
    # de toute facon bien plus souvent en .fr qu'en .com.
    out: list[str] = []
    vus: set[str] = set()
    for tld in (".fr", ".com"):
        for b in bases:
            d = b + tld
            if d not in vus:
                vus.add(d)
                out.append(d)
    # Dix au lieu de quatre. Chaque devinette coute une resolution DNS et au
    # plus une requete : c'est le prix du gain, et il se mesure.
    return out[:10]


def _corps(url: str, taille: int = 200_000) -> str:
    """Rend le contenu d'une page, ou une chaine vide."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            return r.read(taille).decode("utf-8", "ignore")
    except Exception:
        return ""


# Adresses que l'on trouve sur un site sans qu'elles designent la structure :
# celles des outils, des hebergeurs, des exemples laisses dans un gabarit.
EMAILS_A_IGNORER = re.compile(
    r"(example|exemple|sentry|wixpress|godaddy|wordpress|@2x|\.png|\.jpg|\.svg"
    r"|sentry\.io|domain\.com|votre-?email|nom@|email@"
    # Un `www.` dans la partie domaine n'existe pas dans une vraie adresse :
    # c'est le signe qu'on a ramasse une URL collee, pas un email.
    r"|@www\."
    # Domaines techniques d'hebergeurs, servis avant qu'un vrai nom soit pose.
    r"|\.odns\.fr|\.hostingersite\.com|\.wixsite\.com|\.myshopify\.com"
    r"|\.temporary|\.preview|\.cluster\d)",
    re.I,
)

MOTIF_EMAIL = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
)

# Parties locales qui ne designent PERSONNE en particulier. Plus large que la
# liste blanche de la base : `booking@` a ete trouve puis rejete par une
# premiere version parce qu'il n'y figurait pas, alors que c'est une adresse
# de structure au meme titre que `contact@`.
#
# Deux listes distinctes, et c'est voulu. Celle-ci sert a QUALIFIER ce qu'on a
# lu. LOCALES_ACCEPTEES, plus bas, sert a decider ce que la base accepte. Elles
# convergeront le jour ou la contrainte sera elargie, pas avant : c'est la base
# qui fait foi, pas ce fichier.
LOCALES_GENERIQUES = {
    "contact", "info", "infos", "bonjour", "hello", "accueil", "direction",
    "secretariat", "secretaire", "commercial", "admin", "administration",
    "booking", "reservation", "reservations", "boutique", "magasin",
    "bureau", "bde", "asso", "association", "president", "presidence",
    "devis", "rdv", "agence", "cabinet", "atelier", "studio", "mail",
    "courrier", "clients", "service", "sav", "support",
}

# Pages ou une entreprise francaise publie son adresse de contact. Les mentions
# legales viennent en premier : leur presence est une OBLIGATION legale, et
# l'adresse qui s'y trouve est celle de l'editeur, donc la bonne.
CHEMINS_CONTACT = [
    "/mentions-legales", "/mentions-legales/", "/contact", "/contact/",
    "/nous-contacter", "/mentions", "/legal", "/a-propos",
]


def cherche_emails(racine: str, domaine: str) -> tuple[str, str]:
    """Cherche une adresse sur le site, en privilegiant une adresse GENERIQUE.

    Rend (adresse generique, adresse quelconque). La premiere est la seule
    utilisable pour une prospection sans consentement prealable : la contrainte
    de la base exige une partie locale dans une liste blanche, et une adresse
    nominative designe une personne physique.

    Le domaine est compare : une adresse trouvee sur le site mais hebergee
    ailleurs (un prestataire, un reseau social) ne designe pas la structure.
    """
    generique, quelconque = "", ""
    for chemin in [""] + CHEMINS_CONTACT:
        corps = _corps(racine + chemin)
        if not corps:
            continue
        for brut in MOTIF_EMAIL.findall(corps):
            adresse = brut.lower().strip(".")
            if EMAILS_A_IGNORER.search(adresse):
                continue
            locale, _, _hote = adresse.partition("@")
            # Le domaine de l'adresse n'est PAS compare a celui du site.
            # Une premiere version l'exigeait et rejetait
            # `afficheurtempo60@gmail.com`, lu sur le site de la societe : une
            # TPE sur une adresse Gmail est la norme, pas l'exception. Ce qui
            # fonde la confiance ici, c'est que l'adresse est publiee sur le
            # site de la structure, pas qu'elle partage son domaine.
            if locale in LOCALES_GENERIQUES and not generique:
                generique = adresse
            elif not quelconque:
                quelconque = adresse
        if generique:
            break
    return generique, quelconque


def parle_de(url: str, nom: str, domaine: str = "") -> bool:
    """La page doit PARLER de l'entreprise, sinon c'est un homonyme.

    Sans ce controle, la devinette de domaine rendait 8 sites sur 10, dont
    `les.fr`, `union.fr` et `soc.fr` : des domaines appartenant a des tiers.
    Un faux positif est le pire des deux, parce qu'il marque un vrai prospect
    comme deja equipe et le SORT de la liste.

    LE DEFAUT QUE CETTE VERSION CORRIGE, ET QU'IL A FALLU MESURER POUR VOIR.

    La version precedente exigeait qu'un mot du nom figure sur la page. Or un
    mot deja ecrit DANS LE DOMAINE y figure forcement : « sushi » est sur
    `sushi.fr` quoi qu'il arrive, et « SUSHI TOJO » etait donc confirme sans
    que rien n'ait ete verifie. Quatre restaurants distincts se sont ainsi
    retrouves rattaches au meme site.

    Un jeton present dans le domaine ne compte donc plus comme preuve : la
    confirmation doit porter sur ce que le domaine N'ANNONCE PAS.

    Le cas ou il ne reste rien a confirmer n'est pas un echec, c'est le
    contraire : le domaine reprend alors TOUS les mots distinctifs du nom, ce
    qui est la meilleure preuve disponible.
    """
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            corps = r.read(120_000).decode("utf-8", "ignore").lower()
    except Exception:
        return False
    m = jetons(nom)
    if not m:
        return False
    nu = re.sub(r"[^a-z0-9]", "", domaine.rsplit(".", 1)[0].lower())
    utiles = [j for j in m if j not in nu]
    if not utiles:
        return True
    return sum(1 for j in utiles if j in corps) >= max(1, len(utiles) // 2)


def _verifie_une(ligne: dict) -> tuple[dict, str, str, str]:
    """Cherche le site d'une structure, puis son adresse de contact dessus.

    Rend (ligne, site confirme, email generique, email quelconque).

    POURQUOI L'ADRESSE VIENT DU SITE ET NON D'UNE DEVINETTE. Ecrire a
    contact@ndd.fr sans avoir vu cette adresse quelque part, c'est parier sur
    l'existence d'une boite. Le pari rate produit un rebond, et une salve de
    rebonds abime la reputation d'envoi du domaine pour tous les messages
    suivants, y compris les factures. Une adresse LUE sur le site de la
    structure existe, elle est publiee par elle, et elle est destinee a etre
    utilisee.
    """
    for d in candidats(ligne.get("organisation") or ""):
        try:
            socket.gethostbyname(d)
        except Exception:
            continue
        for schema in ("https://", "http://"):
            racine = schema + d
            if parle_de(racine, ligne["organisation"], d):
                generique, quelconque = cherche_emails(racine, d)
                return ligne, racine, generique, quelconque
    return ligne, "", "", ""


def _ecarte_les_domaines_partages(lignes: list[dict]) -> None:
    """Retire les sites revendiques par PLUSIEURS structures differentes.

    LE MOTIF QUE LES GARDES PRECEDENTES NE POUVAIENT PAS VOIR.

    Chaque devinette est evaluee isolement, et confirmee isolement : la page
    parle bien d'un « centre communal d'action sociale », donc elle passe. Vue
    ligne a ligne, aucune anomalie. Vue d'ensemble, `centre-communal-action-
    sociale.fr` etait rattache a DIX-SEPT structures differentes, `autoecole.fr`
    a cinq, `etudiants.com` a quatre.

    Ce sont des noms de METIER generiques, et aucune liste de mots interdits ne
    les rattrape : le nom legal de la structure EST le nom du metier, et il n'y
    a rien de suspect dans un mot pris seul.

    Le signal, lui, est mecanique : **un domaine revendique par plusieurs
    structures distinctes n'appartient a aucune d'elles.** C'est un controle
    GLOBAL, et c'est pour cela qu'il passe apres la recolte et non pendant :
    une garde locale ne peut pas voir une collision entre deux lignes qu'elle
    n'examine jamais ensemble.

    Le seuil est a DEUX, pas a trois. Deux etablissements d'un meme groupe
    peuvent legitimement partager un site, et on en ecarte alors a tort - mais
    la ligne retombe a « a verifier », qui est l'etat SUR, et le motif est
    ecrit dans la note plutot que perdu. Un faux positif garde, lui, sort le
    prospect de la liste sans rien dire.
    """
    par_domaine: dict[str, list[dict]] = {}
    for l in lignes:
        site = (l.get("site_web") or "").strip()
        if not site:
            continue
        domaine = site.split("//", 1)[-1].split("/", 1)[0].lower()
        par_domaine.setdefault(domaine, []).append(l)

    ecartes = 0
    for domaine, groupe in par_domaine.items():
        sirens = {l.get("siren") for l in groupe}
        if len(sirens) < 2:
            continue
        for l in groupe:
            l["site_web"] = ""
            l["a_deja_un_site"] = "à vérifier"
            l["email_generique"] = ""
            note = (l.get("note") or "").strip()
            motif = "site ecarte : {} etait rattache a {} structures".format(
                domaine, len(sirens))
            l["note"] = (note + " | " + motif) if note else motif
            ecartes += 1
    if ecartes:
        print("  {} lignes ramenees a « a verifier » : leur domaine etait "
              "partage par plusieurs structures.".format(ecartes),
              file=sys.stderr)


def verifie(lignes: list[dict], parallele: int = 24,
            sortie: str = "") -> None:
    """Renseigne `site_web` et `a_deja_un_site`.

    N'ecrit JAMAIS « non ». On peut prouver qu'un site existe, jamais qu'il
    n'existe pas : la structure peut etre sur une page Facebook, un annuaire,
    ou un domaine que rien ne permet de deviner. Les deux valeurs honnetes sont
    donc « oui » et « a verifier ».

    LE TRAVAIL EST PARALLELISE, parce qu'il est domine par l'attente reseau et
    non par le calcul : en sequentiel, 3 400 structures demandaient des heures.
    Le parallelisme reste modere - deux douzaines de fils - et chaque requete
    porte un agent utilisateur explicite : on interroge des serveurs qui n'ont
    rien demande, autant le faire discretement.

    ET IL ECRIT AU FIL DE L'EAU. Une passe sur 3 400 structures dure environ
    une demi-heure. Ne materialiser le resultat qu'a la derniere ligne
    transforme la moindre interruption - une coupure, un arret, une erreur au
    dernier pourcent - en perte totale, alors que le travail est fait et tient
    en memoire. La recherche avait deja paye cette lecon le meme jour, la
    verification l'ignorait encore.
    """
    from concurrent.futures import ThreadPoolExecutor, as_completed

    socket.setdefaulttimeout(6)
    a_faire = [l for l in lignes if not l.get("site_web")]
    confirmes = 0

    avec_email, avec_nominative = 0, 0
    with ThreadPoolExecutor(max_workers=parallele) as pool:
        taches = {pool.submit(_verifie_une, l): l for l in a_faire}
        for n, tache in enumerate(as_completed(taches), 1):
            try:
                ligne, trouve, generique, quelconque = tache.result()
            except Exception:
                ligne, trouve, generique, quelconque = taches[tache], "", "", ""
            ligne["site_web"] = trouve
            ligne["a_deja_un_site"] = "oui" if trouve else "à vérifier"
            if sortie and n % 100 == 0:
                ecris(sortie, lignes)
            if generique:
                ligne["email_generique"] = generique
                avec_email += 1
            elif quelconque:
                # Conservee pour information, PAS importable : une adresse
                # nominative designe une personne physique, et la contrainte de
                # la base la refuse. C'est un point de depart pour un appel ou
                # un message ecrit a la main, pas pour une sequence.
                ligne["note"] = ((ligne.get("note") or "") +
                                 " | adresse nominative trouvee : " + quelconque).strip(" |")
                avec_nominative += 1
            if trouve:
                confirmes += 1
            if n % 200 == 0:
                print("  {} / {} verifiees, {} sites, {} emails".format(
                    n, len(a_faire), confirmes, avec_email), file=sys.stderr)

    _ecarte_les_domaines_partages(lignes)

    print("{} sites confirmes sur {}.".format(confirmes, len(a_faire)),
          file=sys.stderr)
    print("{} adresses GENERIQUES relevees sur ces sites : celles-la sont "
          "importables.".format(avec_email), file=sys.stderr)
    print("{} adresses nominatives notees pour information : elles designent "
          "une personne physique, la base les refuse.".format(avec_nominative),
          file=sys.stderr)
    print("Un « a verifier » ne veut PAS dire « pas de site » : on peut prouver "
          "qu'un site existe, jamais qu'il n'existe pas.", file=sys.stderr)


# --------------------------------------------------------------------------
# importer
# --------------------------------------------------------------------------

LOCALES_ACCEPTEES = {
    "contact", "info", "bonjour", "hello", "accueil",
    "direction", "secretariat", "commercial", "admin",
}


def importe(lignes: list[dict]) -> int:
    """Ecrit les lignes qualifiees dans `public.contacts` via l'API Supabase.

    Ne prend que les lignes qui portent une adresse email GENERIQUE. La base
    refuserait les autres de toute facon - la contrainte `contacts_b2b_strict`
    exige un SIREN, une nature juridique connue, un statut de diffusion `O` et
    une partie locale dans la liste blanche - mais autant ne pas lui envoyer ce
    qu'elle va rejeter.
    """
    url = os.environ.get("SUPABASE_URL")
    cle = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not cle:
        print("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent etre dans "
              "l'environnement. Aucune valeur n'est lue depuis le depot.",
              file=sys.stderr)
        return 2

    a_envoyer, ecartees = [], 0
    for l in lignes:
        email = (l.get("email_generique") or "").strip().lower()
        if not email or "@" not in email:
            ecartees += 1
            continue
        if email.split("@", 1)[0] not in LOCALES_ACCEPTEES:
            print("  ecartee, partie locale non generique : {}".format(email),
                  file=sys.stderr)
            ecartees += 1
            continue
        a_envoyer.append({
            "email": email,
            "organisation": l.get("organisation") or None,
            "siren": l.get("siren") or None,
            "nature_juridique": l.get("nature_juridique") or None,
            "statut_diffusion": l.get("statut_diffusion") or None,
            "regime": "b2b_generique",
            "statut": "en_attente",
            "source": l.get("source") or "annuaire-entreprises.data.gouv.fr",
        })

    if not a_envoyer:
        print("Aucune ligne importable : la colonne email_generique est vide. "
              "L'annuaire public ne publie pas d'adresses, elle se remplit a "
              "la main.", file=sys.stderr)
        return 1

    requete = urllib.request.Request(
        url.rstrip("/") + "/rest/v1/contacts?on_conflict=email",
        data=json.dumps(a_envoyer).encode("utf-8"),
        method="POST",
        headers={
            "apikey": cle,
            "Authorization": "Bearer " + cle,
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=minimal",
        },
    )
    try:
        with urllib.request.urlopen(requete, timeout=60) as r:
            statut = r.status
    except urllib.error.HTTPError as err:
        print("Refus de la base : HTTP {} - {}".format(
            err.code, err.read().decode("utf-8", "ignore")[:400]), file=sys.stderr)
        return 1

    print("{} contact(s) importe(s), {} ecartee(s). HTTP {}".format(
        len(a_envoyer), ecartees, statut), file=sys.stderr)
    print("Rien ne part pour autant : c'est le moteur du site qui envoie, avec "
          "ses sequences, sa liste de suppression et sa desinscription en un "
          "clic.", file=sys.stderr)
    return 0


# --------------------------------------------------------------------------
# entree / sortie
# --------------------------------------------------------------------------

def lis(chemin: str) -> list[dict]:
    with io.open(chemin, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def ecris(chemin: str, lignes: list[dict]) -> None:
    with io.open(chemin, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLONNES)
        w.writeheader()
        for l in lignes:
            w.writerow({c: l.get(c, "") for c in COLONNES})


def refuse_le_depot(chemin: str) -> bool:
    return "blf-labs-site" in chemin.replace("\\", "/")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sous = p.add_subparsers(dest="commande", required=True)

    c = sous.add_parser("chercher", help="constitue une base depuis l'annuaire public")
    perimetre = c.add_mutually_exclusive_group(required=True)
    perimetre.add_argument("--departements", help="codes separes par des virgules, ex 94,92,91")
    perimetre.add_argument("--region", help="code de region, ex 11 pour l'Ile-de-France")
    perimetre.add_argument("--national", action="store_true", help="toute la France")
    c.add_argument("--par-section", type=int, default=25,
                   help="entreprises retenues par section d'activite ET PAR "
                        "DEPARTEMENT. 120 donne environ 109 000 fiches sur "
                        "toute la France avant dedoublonnage.")
    c.add_argument("--inclure-entreprises-individuelles", action="store_true",
                   help="leve l'exclusion des personnes physiques (lire l'entete avant)")
    c.add_argument("--niche", choices=sorted(NICHES),
                   help="cible une niche par codes NAF plutot que par section "
                        "d'activite. Une section melange des metiers qui "
                        "n'achetent pas la meme chose.")
    c.add_argument("--parallele", type=int, default=5,
                   help="requetes en vol. L'API publique tolere 7/s, on reste "
                        "en dessous : la faire tomber priverait tout le monde "
                        "de la donnee.")
    c.add_argument("--sortie", required=True, help="CSV a ecrire, HORS du depot")

    b = sous.add_parser("bde", help="cherche les associations etudiantes")
    perim_bde = b.add_mutually_exclusive_group()
    perim_bde.add_argument("--departements", help="codes separes par des virgules")
    perim_bde.add_argument("--region", help="code de region")
    b.add_argument("--par-requete", type=int, default=200,
                   help="resultats retenus par formulation de recherche")
    b.add_argument("--inclure-entreprises-individuelles", action="store_true")
    b.add_argument("--sortie", required=True, help="CSV a ecrire, HORS du depot")

    v = sous.add_parser("verifier", help="cherche un site web et le confirme")
    v.add_argument("--fichier", required=True)
    v.add_argument("--parallele", type=int, default=24,
                   help="nombre de verifications simultanees")

    e = sous.add_parser("exporter", help="ecrit un classeur Excel")
    e.add_argument("--fichier", required=True)
    e.add_argument("--sortie", required=True)

    i = sous.add_parser("importer", help="charge les lignes qualifiees en base")
    i.add_argument("--fichier", required=True)

    a = p.parse_args()

    if a.commande == "chercher":
        if refuse_le_depot(a.sortie):
            print("Refus : la sortie porte des donnees relatives a des personnes "
                  "et ne doit pas etre ecrite dans le depot.", file=sys.stderr)
            return 2
        if a.departements:
            perim = {"departement": a.departements}
        elif a.region:
            perim = {"region": a.region}
        else:
            perim = {}
        lignes = cherche(perim, a.par_section, a.inclure_entreprises_individuelles,
                         a.parallele, a.sortie, a.niche)
        if not lignes:
            print("Aucun resultat.", file=sys.stderr)
            return 1
        ecris(a.sortie, lignes)
        print("\n{} structures ecrites dans {}".format(len(lignes), a.sortie),
              file=sys.stderr)
        print("Aucune adresse email : l'annuaire public n'en publie pas.",
              file=sys.stderr)
        return 0

    if a.commande == "bde":
        if refuse_le_depot(a.sortie):
            print("Refus : sortie dans le depot.", file=sys.stderr)
            return 2
        if a.departements:
            perim = {"departement": a.departements}
        elif a.region:
            perim = {"region": a.region}
        else:
            perim = {}
        lignes = cherche_bde(perim, a.par_requete,
                             a.inclure_entreprises_individuelles)
        if not lignes:
            print("Aucun resultat.", file=sys.stderr)
            return 1
        ecris(a.sortie, lignes)
        print("{} associations etudiantes ecrites dans {}".format(
            len(lignes), a.sortie), file=sys.stderr)
        return 0

    if a.commande == "verifier":
        lignes = lis(a.fichier)
        verifie(lignes, a.parallele, a.fichier)
        ecris(a.fichier, lignes)
        return 0

    if a.commande == "exporter":
        if refuse_le_depot(a.sortie):
            print("Refus : sortie dans le depot.", file=sys.stderr)
            return 2
        from prospection_excel import ecris_classeur  # voisin de ce fichier
        ecris_classeur(lis(a.fichier), a.sortie)
        return 0

    if a.commande == "importer":
        return importe(lis(a.fichier))

    return 1


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    raise SystemExit(main())
