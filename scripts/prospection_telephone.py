"""Collecte des numeros a appeler, par lots courts.

    python scripts/prospection_telephone.py --departement 94 --lot 40
    python scripts/prospection_telephone.py --departement 94 --lot 40 --importer

POURQUOI CE COLLECTEUR EXISTE, ET CE QU'IL CORRIGE.

Le courriel a froid butait sur une correlation qu'aucun reglage ne repare : une
structure joignable par courriel a un domaine, donc un site, donc deja un
prestataire. Mesure du 27 aout sur 2 911 structures verifiees : 811 ont un site,
181 publient une adresse exploitable. Six pour cent, et ce sont les six pour
cent qui ont le moins besoin de nous.

MESURE DU 28 AOUT, Val-de-Marne et abords immediats, commerces et services
cartographies dans OpenStreetMap :

    21 157  fiches
     7 143  portent un telephone                      34 %
     2 827  un telephone et AUCUN site web            13 %
     2 634  ni site, ni Facebook, ni Instagram
     2 554  et portent un nom exploitable
       336  dont enseignes de chaine, ecartees
    ------
     2 218  appelables, sur UN SEUL departement

Le renversement n'est pas d'echelle, il est de NATURE : ce collecteur vise
precisement les structures SANS site, c'est-a-dire celles qui ont quelque chose
a acheter.

L'ANNUAIRE PUBLIC NE PUBLIE PAS DE TELEPHONE. Verifie le 28 aout, champ par
champ, sur `recherche-entreprises.api.gouv.fr` : ni `telephone`, ni `contact`,
ni rien d'approchant, ni sur la fiche ni sur le siege. La source est donc
OpenStreetMap, ou le numero est publie par le commercant lui-meme ou par un
contributeur, et l'adresse exacte de la fiche est conservee pour que la personne
puisse verifier ce qu'on lui dit de la source.

POURQUOI PAR LOTS DE QUARANTE, ET PAS PAR DEPARTEMENT.

L'information de l'article 14 est due dans le MOIS qui suit la collecte.
Ramasser deux mille numeros en une passe fabrique donc le manquement a
l'echelle : on ne pourra pas informer deux mille personnes en trente jours, et
chaque jour qui passe aggrave. La garde `peut_appeler` refuse deja une fiche
collectee il y a plus de trente jours et jamais informee ; ce plafond-ci evite
d'en fabriquer.

CE QUE CE SCRIPT NE FAIT PAS. Il n'appelle personne, il ne compose aucun numero
et il n'enregistre rien. Un composeur automatique ferait basculer le dispositif
entier sous un regime de consentement prealable, et cette ligne n'est pas a
franchir pour gagner quelques minutes.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prospection_monde import MIROIRS, OverpassIndisponible  # noqa: E402

# Plafond dur. Voir l'en-tete : au-dela, on fabrique un manquement a l'article
# 14 qu'aucune bonne volonte ne rattrapera.
LOT_MAXIMUM = 60

# Ce qu'on cherche : des commerces et des services de proximite, tenus par
# quelqu'un qui decroche son telephone.
SELECTEURS = [
    'nwr["shop"]',
    'nwr["craft"]',
    'nwr["office"]',
    'nwr["amenity"~"^(restaurant|cafe|bar|driving_school|veterinary)$"]',
    'nwr["leisure"~"^(fitness_centre|sports_centre|dance)$"]',
]

# Enseignes : la decision n'est pas locale, et le gerant n'achete pas de site.
MARQUEURS_DE_CHAINE = ("brand", "operator", "brand:wikidata")


def normalise(brut: str) -> str | None:
    """Meme regle que `normalise_telephone` en base, et c'est volontaire.

    Ecrire la normalisation deux fois est un risque de divergence assume : la
    base est l'AUTORITE, elle refuse a l'ecriture ce qui n'est pas canonique, et
    un ecart se solderait donc par un refus bruyant a l'import. La copie Python
    ne sert qu'a ne pas envoyer ce qui sera rejete.
    """
    chiffres = re.sub(r"[^0-9+]", "", brut or "")
    if re.fullmatch(r"\+33[1-9][0-9]{8}", chiffres):
        return chiffres
    if re.fullmatch(r"0[1-9][0-9]{8}", chiffres):
        return "+33" + chiffres[1:]
    if re.fullmatch(r"0033[1-9][0-9]{8}", chiffres):
        return "+33" + chiffres[4:]
    return None


def interroge(requete: str) -> dict:
    donnees = urllib.parse.urlencode({"data": requete}).encode("utf-8")
    dernier = "aucune tentative"
    for tour in range(2):
        for miroir in MIROIRS:
            demande = urllib.request.Request(
                miroir, data=donnees, method="POST",
                headers={"User-Agent":
                         "blf-labs-prospection/1.0 (contact@beloucif.com)"})
            try:
                with urllib.request.urlopen(demande, timeout=240) as reponse:
                    return json.load(reponse)
            except Exception as err:
                dernier = "{} sur {}".format(
                    err, urllib.parse.urlsplit(miroir).netloc)
        if tour == 0:
            time.sleep(45)
    raise OverpassIndisponible(dernier)


def collecte(departement: str, lot: int) -> list[dict]:
    """Ramene au plus `lot` fiches appelables du departement demande.

    Le perimetre est pose par le code INSEE du departement, pas par une boite
    englobante : une boite deborde sur les departements voisins, et on
    appellerait alors des gens en annoncant qu'on les a trouves ailleurs.
    """
    corps = ";".join("{}(area.d)".format(s) for s in SELECTEURS)
    requete = (
        '[out:json][timeout:220];'
        'area["ref:INSEE"="{}"]["admin_level"="6"]->.d;'
        '({};);out tags center;'
    ).format(departement, corps)

    data = interroge(requete)
    elements = data.get("elements") or []
    print("  {} fiches cartographiees dans le {}".format(len(elements), departement),
          file=sys.stderr)

    retenues: list[dict] = []
    vus: set[str] = set()
    ecarts = {"sans_telephone": 0, "a_un_site": 0, "reseau_social": 0,
              "sans_nom": 0, "chaine": 0, "numero_invalide": 0, "doublon": 0}

    for e in elements:
        t = e.get("tags") or {}

        brut = t.get("phone") or t.get("contact:phone")
        if not brut:
            ecarts["sans_telephone"] += 1
            continue
        # Une fiche peut porter plusieurs numeros separes par un point-virgule.
        # Sans ce decoupage, la chaine entiere est rejetee par la
        # normalisation, et on perd une fiche parfaitement valable.
        brut = brut.split(";")[0].strip()

        if t.get("website") or t.get("contact:website"):
            ecarts["a_un_site"] += 1
            continue
        # Une page Facebook ou Instagram tient lieu de site pour beaucoup de
        # commerces. Les appeler en disant « vous n'avez pas de presence en
        # ligne » serait faux, et une accroche fausse coute l'appel entier.
        if any(t.get(c) for c in
               ("contact:facebook", "facebook", "contact:instagram", "instagram")):
            ecarts["reseau_social"] += 1
            continue
        if any(t.get(c) for c in MARQUEURS_DE_CHAINE):
            ecarts["chaine"] += 1
            continue

        nom = (t.get("name") or "").strip()
        if not nom:
            ecarts["sans_nom"] += 1
            continue

        numero = normalise(brut)
        if not numero:
            ecarts["numero_invalide"] += 1
            continue
        if numero in vus:
            ecarts["doublon"] += 1
            continue
        vus.add(numero)

        retenues.append({
            "numero": numero,
            "organisation": nom,
            "activite": t.get("shop") or t.get("craft") or t.get("office")
                        or t.get("amenity") or t.get("leisure") or "",
            "commune": t.get("addr:city") or "",
            "code_postal": t.get("addr:postcode") or "",
            "source": "openstreetmap.org",
            "source_url": "https://www.openstreetmap.org/{}/{}".format(
                e.get("type"), e.get("id")),
        })
        if len(retenues) >= lot:
            break

    print("  ecartees : " + ", ".join(
        "{} {}".format(n, motif.replace("_", " "))
        for motif, n in ecarts.items() if n), file=sys.stderr)
    return retenues


def importe(lignes: list[dict]) -> int:
    url = os.environ.get("SUPABASE_URL")
    cle = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not cle:
        print("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent etre dans "
              "l'environnement.", file=sys.stderr)
        return 2

    requete = urllib.request.Request(
        url.rstrip("/") + "/rest/v1/telephones?on_conflict=numero",
        data=json.dumps(lignes).encode("utf-8"),
        method="POST",
        headers={"apikey": cle, "Authorization": "Bearer " + cle,
                 "Content-Type": "application/json",
                 "Prefer": "resolution=ignore-duplicates,return=minimal"})
    try:
        with urllib.request.urlopen(requete, timeout=60) as r:
            statut = r.status
    except urllib.error.HTTPError as err:
        print("Refus de la base : HTTP {} - {}".format(
            err.code, err.read().decode("utf-8", "ignore")[:400]), file=sys.stderr)
        return 1

    print("{} numero(s) importe(s). HTTP {}".format(len(lignes), statut),
          file=sys.stderr)
    print("Rien n'appelle personne : composer un numero reste un geste humain.",
          file=sys.stderr)
    return 0


def main() -> int:
    p = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--departement", required=True,
                   help="code INSEE, ex 94")
    p.add_argument("--lot", type=int, default=40,
                   help="nombre de fiches ramenees. Plafonne a {} : au-dela on "
                        "fabrique un manquement a l'article 14 qu'on ne "
                        "rattrapera pas.".format(LOT_MAXIMUM))
    p.add_argument("--sortie", help="CSV a ecrire, HORS du depot")
    p.add_argument("--importer", action="store_true",
                   help="ecrit en base. Sans lui, la commande se contente "
                        "d'annoncer ce qu'elle a trouve.")
    a = p.parse_args()

    if a.lot > LOT_MAXIMUM:
        print("Lot de {} refuse : le plafond est {}. L'information de l'article "
              "14 est due dans le mois qui suit la collecte, et ramasser plus "
              "que ce qu'on peut informer fabrique le manquement a l'echelle."
              .format(a.lot, LOT_MAXIMUM), file=sys.stderr)
        return 2

    try:
        lignes = collecte(a.departement, a.lot)
    except OverpassIndisponible as err:
        print("Overpass indisponible : {}. Rien n'a ete ecrit.".format(err),
              file=sys.stderr)
        return 2

    if not lignes:
        print("Aucune fiche appelable.", file=sys.stderr)
        return 1

    print("\n{} fiche(s) appelable(s) :".format(len(lignes)), file=sys.stderr)
    for l in lignes[:10]:
        print("  {:16s} {:34s} {}".format(
            l["numero"], l["organisation"][:34], l["activite"]), file=sys.stderr)
    if len(lignes) > 10:
        print("  ... et {} autres".format(len(lignes) - 10), file=sys.stderr)

    if a.sortie:
        import csv
        with io.open(a.sortie, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(lignes[0].keys()))
            w.writeheader()
            w.writerows(lignes)
        print("\nEcrit dans {}".format(a.sortie), file=sys.stderr)

    if not a.importer:
        print("\nRien n'a ete ecrit en base. Relancer avec --importer.",
              file=sys.stderr)
        return 0

    return importe(lignes)


if __name__ == "__main__":
    raise SystemExit(main())
