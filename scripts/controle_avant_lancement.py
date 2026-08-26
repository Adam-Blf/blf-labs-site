"""Verifie sur un site EN LIGNE les vingt points a tenir avant un lancement.

POURQUOI CE SCRIPT PLUTOT QU'UNE LISTE A COCHER.

Une liste a cocher se coche de memoire, et la memoire se trompe dans le sens
qui arrange. Chaque point ci-dessous est donc verifie par une requete reelle
sur le site publie, et le resultat porte la preuve : le code HTTP obtenu, la
balise trouvee, le nombre d'occurrences.

Trois verdicts, et la nuance compte :

    OK        constate sur la page
    ABSENT    cherche et non trouve
    A LA MAIN le point ne se verifie pas depuis un programme

« A LA MAIN » n'est pas une echappatoire : c'est le seul verdict honnete pour
la fiche Google ou la sincerite d'un avis, qu'aucune requete HTTP ne tranche.
Les annoncer OK serait mentir, les annoncer ABSENT le serait tout autant.

Usage :
    python scripts/controle_avant_lancement.py https://beloucif.com
"""

from __future__ import annotations

import re
import sys
import urllib.error
import urllib.request

AGENT = {"User-Agent": "Mozilla/5.0 (controle avant lancement)"}


def recupere(url: str) -> tuple[int, str]:
    """Rend (code HTTP, corps). Le code 0 signale une erreur reseau."""
    try:
        req = urllib.request.Request(url, headers=AGENT)
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.read(400_000).decode("utf-8", "ignore")
    except urllib.error.HTTPError as err:
        try:
            return err.code, err.read(400_000).decode("utf-8", "ignore")
        except Exception:
            return err.code, ""
    except Exception:
        return 0, ""


class Controle:
    def __init__(self, racine: str) -> None:
        self.racine = racine.rstrip("/")
        self.resultats: list[tuple[int, str, str, str]] = []
        self._cache: dict[str, tuple[int, str]] = {}

    def page(self, chemin: str = "") -> tuple[int, str]:
        if chemin not in self._cache:
            self._cache[chemin] = recupere(self.racine + chemin)
        return self._cache[chemin]

    def note(self, n: int, titre: str, verdict: str, preuve: str) -> None:
        self.resultats.append((n, titre, verdict, preuve))

    # ------------------------------------------------------------------
    def tout(self) -> None:
        code, accueil = self.page("")
        if code != 200:
            print("Le site ne repond pas : HTTP {}".format(code))
            return

        self.p01_404()
        self.p02_cta_avant_scroll(accueil)
        self.p03_liens_internes(accueil)
        self.p04_remerciement()
        self.p05_fil_ariane()
        self.p06_etudes_de_cas()
        self.p07_faq()
        self.p08_delai_reponse(accueil)
        self.p09_cta_mobile(accueil)
        self.p10_robots()
        self.p11_titres_uniques()
        self.p12_meta_descriptions()
        self.p13_image_partage(accueil)
        self.p14_carte_itineraire()
        self.p15_avis()
        self.p16_alt(accueil)
        self.p17_fiche_google()
        self.p18_confidentialite()
        self.p19_analytics(accueil)
        self.p20_photo_profil()

    # ------------------------------------------------------------------
    def p01_404(self) -> None:
        code, corps = self.page("/cette-page-nexiste-pas-controle")
        if code != 404:
            self.note(1, "Page 404 personnalisee", "ABSENT",
                      "une adresse inexistante rend HTTP {} au lieu de 404".format(code))
        elif len(corps) > 1500 and re.search(r"accueil|retour|introuvable", corps, re.I):
            self.note(1, "Page 404 personnalisee", "OK",
                      "404 servie, {} octets, avec un lien de retour".format(len(corps)))
        else:
            self.note(1, "Page 404 personnalisee", "ABSENT",
                      "404 servie mais page nue, {} octets".format(len(corps)))

    def p02_cta_avant_scroll(self, corps: str) -> None:
        # On ne peut pas mesurer un pli sans navigateur. Ce qu'on peut faire,
        # c'est verifier qu'une action existe TOT dans le document.
        debut = corps[:20_000]
        actions = re.findall(
            r'href="([^"]*(?:commander|contact|devis|rendez-vous|reserver)[^"]*)"',
            debut, re.I)
        if actions:
            self.note(2, "Appel a l'action avant le scroll", "OK",
                      "premiere action dans les 20 premiers ko : {}".format(actions[0]))
        else:
            self.note(2, "Appel a l'action avant le scroll", "ABSENT",
                      "aucun lien d'action dans le haut du document")

    def p03_liens_internes(self, corps: str) -> None:
        liens = set(re.findall(r'href="(/[^"#?]*)"', corps))
        if len(liens) >= 8:
            self.note(3, "Liens internes", "OK",
                      "{} destinations internes distinctes sur l'accueil".format(len(liens)))
        else:
            self.note(3, "Liens internes", "ABSENT",
                      "seulement {} destinations internes".format(len(liens)))

    def p04_remerciement(self) -> None:
        for chemin in ("/commander/merci", "/merci", "/contact/merci",
                       "/reserver/merci"):
            code, corps = self.page(chemin)
            if code == 200:
                self.note(4, "Page de remerciement", "OK",
                          "{} repond 200".format(chemin))
                return
        self.note(4, "Page de remerciement", "ABSENT",
                  "aucune page de confirmation trouvee aux adresses usuelles")

    def p05_fil_ariane(self) -> None:
        for chemin in ("/tarifs", "/contact", "/methode", "/faq", "/parcours"):
            code, corps = self.page(chemin)
            if code == 200 and "BreadcrumbList" in corps:
                self.note(5, "Fil d'Ariane", "OK",
                          "donnees structurees BreadcrumbList sur {}".format(chemin))
                return
        self.note(5, "Fil d'Ariane", "ABSENT",
                  "aucun BreadcrumbList trouve sur les pages testees")

    def p06_etudes_de_cas(self) -> None:
        for chemin in ("/references", "/realisations", "/projets", "/portfolio"):
            code, corps = self.page(chemin)
            if code == 200 and len(corps) > 3000:
                self.note(6, "Etudes de cas", "OK",
                          "{} repond 200, {} octets".format(chemin, len(corps)))
                return
        self.note(6, "Etudes de cas", "ABSENT", "aucune page de realisations trouvee")

    def p07_faq(self) -> None:
        for chemin in ("/questions", "/faq", "/aide"):
            code, corps = self.page(chemin)
            if code != 200:
                continue
            questions = len(re.findall(r'"@type"\s*:\s*"Question"', corps))
            if questions >= 5:
                self.note(7, "Cinq questions frequentes", "OK",
                          "{} questions balisees sur {}".format(questions, chemin))
            elif questions:
                self.note(7, "Cinq questions frequentes", "ABSENT",
                          "seulement {} questions balisees sur {}".format(questions, chemin))
            else:
                self.note(7, "Cinq questions frequentes", "ABSENT",
                          "{} existe mais sans balisage FAQPage".format(chemin))
            return
        self.note(7, "Cinq questions frequentes", "ABSENT", "aucune page de questions")

    def p08_delai_reponse(self, accueil: str) -> None:
        motif = re.compile(r"(sous \d+\s*(h|heures|jours)|reponse sous|dans les \d+"
                           r"\s*(h|heures|jours)|24\s*h|48\s*h)", re.I)
        for chemin, corps in (("/", accueil), ("/contact", self.page("/contact")[1]),
                              ("/commander", self.page("/commander")[1])):
            m = motif.search(corps or "")
            if m:
                self.note(8, "Delai de reponse annonce", "OK",
                          "« {} » sur {}".format(m.group(0).strip(), chemin))
                return
        self.note(8, "Delai de reponse annonce", "ABSENT",
                  "aucun delai de reponse trouve sur l'accueil, le contact ni la commande")

    def p09_cta_mobile(self, corps: str) -> None:
        if re.search(r"(sticky|fixed).{0,400}(commander|contact|devis|rendez-vous|reserver)",
                     corps, re.I | re.S):
            self.note(9, "Appel a l'action fixe sur mobile", "OK",
                      "element fixe portant une action trouve dans le balisage")
        else:
            self.note(9, "Appel a l'action fixe sur mobile", "A LA MAIN",
                      "non decidable sur le HTML seul, le positionnement vient du CSS")

    def p10_robots(self) -> None:
        code, corps = self.page("/robots.txt")
        if code == 200 and "sitemap" in corps.lower():
            self.note(10, "robots.txt", "OK", "servi et declare un sitemap")
        elif code == 200:
            self.note(10, "robots.txt", "ABSENT", "servi mais sans declaration de sitemap")
        else:
            self.note(10, "robots.txt", "ABSENT", "HTTP {}".format(code))

    def _titre(self, corps: str) -> str:
        m = re.search(r"<title[^>]*>(.*?)</title>", corps, re.I | re.S)
        return re.sub(r"\s+", " ", m.group(1)).strip() if m else ""

    def p11_titres_uniques(self) -> None:
        pages = ["", "/contact", "/tarifs", "/methode", "/references", "/questions",
                 "/reserver", "/faq", "/parcours"]
        titres = {}
        for c in pages:
            code, corps = self.page(c)
            if code == 200:
                t = self._titre(corps)
                if t:
                    titres.setdefault(t, []).append(c or "/")
        doublons = {t: v for t, v in titres.items() if len(v) > 1}
        if not titres:
            self.note(11, "Titres de page uniques", "ABSENT", "aucun titre lu")
        elif doublons:
            t, v = next(iter(doublons.items()))
            self.note(11, "Titres de page uniques", "ABSENT",
                      "« {} » partage par {}".format(t[:40], ", ".join(v)))
        else:
            self.note(11, "Titres de page uniques", "OK",
                      "{} pages testees, {} titres distincts".format(
                          sum(len(v) for v in titres.values()), len(titres)))

    def p12_meta_descriptions(self) -> None:
        manquantes = []
        testees = 0
        for c in ["", "/contact", "/tarifs", "/methode", "/references", "/reserver"]:
            code, corps = self.page(c)
            if code != 200:
                continue
            testees += 1
            if not re.search(r'<meta[^>]+name="description"[^>]+content="[^"]{20,}"',
                             corps, re.I):
                manquantes.append(c or "/")
        if not testees:
            self.note(12, "Meta descriptions", "ABSENT", "aucune page testee")
        elif manquantes:
            self.note(12, "Meta descriptions", "ABSENT",
                      "absente sur {}".format(", ".join(manquantes)))
        else:
            self.note(12, "Meta descriptions", "OK",
                      "presente sur les {} pages testees".format(testees))

    def p13_image_partage(self, corps: str) -> None:
        m = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', corps, re.I)
        if not m:
            self.note(13, "Image de partage", "ABSENT", "aucune balise og:image")
            return
        url = m.group(1)
        code, _ = recupere(url if url.startswith("http") else self.racine + url)
        self.note(13, "Image de partage", "OK" if code == 200 else "ABSENT",
                  "og:image declaree, HTTP {} a la recuperation".format(code))

    def p14_carte_itineraire(self) -> None:
        for c in ("", "/contact", "/mentions-legales", "/legal/mentions"):
            code, corps = self.page(c)
            if code != 200:
                continue
            if re.search(r"(maps\.google|google\.com/maps|openstreetmap|itineraire)",
                         corps, re.I):
                self.note(14, "Carte et itineraire", "OK",
                          "lien de carte ou d'itineraire sur {}".format(c or "/"))
                return
        self.note(14, "Carte et itineraire", "ABSENT",
                  "aucun lien de carte trouve. A ne PAS ajouter si l'adresse est un "
                  "domicile que l'on ne veut pas exposer")

    def p15_avis(self) -> None:
        """Trois verdicts, pas deux, et c'est ce qui rend ce point utilisable.

        La premiere version cherchait un balisage `Review` et rendait ABSENT
        sinon. Elle sanctionnait donc deux sites pour des raisons opposees :
        l'un parce qu'il refuse d'inventer un temoignage, l'autre parce qu'il
        refuse d'emettre un `aggregateRating` sur des avis repris d'une autre
        plateforme, ce que Google interdit explicitement.

        Dans les deux cas, le code avait raison et la garde le punissait. La
        regle n'est pas « affiche des avis », c'est « n'affiche jamais un avis
        que la personne n'a pas ecrit ». Un site sans avis passe le point ; ce
        qui manque vraiment, c'est une CHAINE DE COLLECTE.
        """
        for c in ("", "/avis", "/references", "/temoignages"):
            code, corps = self.page(c)
            if code == 200 and re.search(r'"@type"\s*:\s*"Review"', corps):
                self.note(15, "Preuve sociale reelle", "OK",
                          "avis balises en donnees structurees sur {}".format(c or "/"))
                return

        # Une page dediee qui annonce l'attente d'un premier temoignage est le
        # signe d'une chaine de collecte en place, pas d'un oubli.
        for c in ("/avis", "/temoignages"):
            code, corps = self.page(c)
            if code == 200 and re.search(
                    r"(premiers? t[eé]moignages?|d[eè]s qu|seront publi)", corps, re.I):
                self.note(15, "Preuve sociale reelle", "OK",
                          "page {} en place, en attente d'un premier "
                          "temoignage depose".format(c))
                return

        self.note(15, "Preuve sociale reelle", "ABSENT",
                  "ni avis publie, ni page de collecte. Ne PAS combler en "
                  "ecrivant un temoignage : c'est une pratique commerciale "
                  "trompeuse, article L121-2")

    def p16_alt(self, corps: str) -> None:
        images = re.findall(r"<img\b[^>]*>", corps, re.I)
        if not images:
            self.note(16, "Texte alternatif des images", "OK",
                      "aucune balise img sur l'accueil")
            return
        sans = [i for i in images if not re.search(r'\balt\s*=', i, re.I)]
        if sans:
            self.note(16, "Texte alternatif des images", "ABSENT",
                      "{} image(s) sur {} sans attribut alt".format(len(sans), len(images)))
        else:
            self.note(16, "Texte alternatif des images", "OK",
                      "{} images, toutes avec un alt".format(len(images)))

    def p17_fiche_google(self) -> None:
        self.note(17, "Fiche Google d'etablissement", "A LA MAIN",
                  "ne se verifie pas depuis le site : a controler dans la console "
                  "Google Business Profile")

    def p18_confidentialite(self) -> None:
        for c in ("/legal/confidentialite", "/confidentialite",
                  "/politique-de-confidentialite"):
            code, _ = self.page(c)
            if code == 200:
                self.note(18, "Page de confidentialite", "OK", "{} repond 200".format(c))
                return
        self.note(18, "Page de confidentialite", "ABSENT",
                  "aucune page de confidentialite. Obligatoire des qu'une donnee "
                  "personnelle est collectee")

    def p19_analytics(self, corps: str) -> None:
        """Cherche un traceur, sans confondre une classe CSS avec un identifiant.

        DEFAUT PAYE ICI, ET IL FAUT LE GARDER ECRIT. La premiere version cherchait
        `G-[A-Z0-9]{8,}` avec le drapeau d'insensibilite a la casse. Ce drapeau
        fait correspondre `bg-gradient`, presente sur toute page Tailwind. La
        garde rendait donc VERT sur un site ou aucun traceur n'etait charge, et
        elle l'a fait sur beloucif.com.

        Deux lecons dans un seul bug. Une garde se valide en la voyant ROUGE, et
        celle-ci ne l'avait jamais ete. Et un motif insensible a la casse sur un
        identifiant SENSIBLE a la casse n'est pas une commodite, c'est une faute.

        Second correctif : l'absence de traceur dans le HTML initial n'est pas un
        manque quand le chargement est conditionne au consentement. C'est meme
        le comportement exige par la CNIL. Le verdict honnete est alors « a la
        main », parce qu'un programme qui ne clique pas sur le bandeau ne peut
        pas trancher.
        """
        # Insensible a la casse pour les NOMS de service, sensible pour
        # l'identifiant, qui est en majuscules par construction.
        service = re.search(r"(googletagmanager\.com|gtag/js|plausible\.io|"
                            r"matomo|umami)", corps, re.I)
        identifiant = re.search(r"\bG-[A-Z0-9]{8,}\b", corps)

        if service or identifiant:
            self.note(19, "Mesure d'audience", "OK",
                      "traceur charge dans le HTML initial : {}".format(
                          (service or identifiant).group(0)))
            return

        # Un chargement conditionne au consentement se reconnait au bandeau.
        bandeau = re.search(r"(consent|cookie|traceur)", corps, re.I)
        if bandeau:
            self.note(19, "Mesure d'audience", "A LA MAIN",
                      "aucun traceur dans le HTML initial, mais un bandeau de "
                      "consentement est present : conforme. A verifier APRES "
                      "acceptation, ce qu'un programme ne peut pas faire")
        else:
            self.note(19, "Mesure d'audience", "ABSENT",
                      "aucun traceur et aucun bandeau de consentement")

    def p20_photo_profil(self) -> None:
        for c in ("", "/a-propos", "/parcours", "/qui-suis-je", "/equipe"):
            code, corps = self.page(c)
            if code != 200:
                continue
            if re.search(r'<img[^>]+(alt="[^"]*(portrait|photo de|fondateur|praticien)'
                         r'[^"]*"|src="[^"]*(portrait|photo|profil)[^"]*")', corps, re.I):
                self.note(20, "Photo de profil", "OK",
                          "image de personne reperee sur {}".format(c or "/"))
                return
        self.note(20, "Photo de profil", "A LA MAIN",
                  "aucune image identifiable comme portrait. Un programme ne "
                  "distingue pas un visage d'une photo d'ambiance")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    racine = sys.argv[1]
    print("Controle avant lancement : {}\n".format(racine))
    c = Controle(racine)
    c.tout()
    if not c.resultats:
        return 1

    largeur = max(len(t) for _, t, _, _ in c.resultats)
    compte = {"OK": 0, "ABSENT": 0, "A LA MAIN": 0}
    for n, titre, verdict, preuve in sorted(c.resultats):
        compte[verdict] = compte.get(verdict, 0) + 1
        marque = {"OK": "  OK ", "ABSENT": " MANQUE", "A LA MAIN": " MAIN"}[verdict]
        print("{:>2}. {:<{l}} {:<8} {}".format(n, titre, marque, preuve, l=largeur))

    print("\n{} tenus, {} manquants, {} a verifier a la main.".format(
        compte["OK"], compte["ABSENT"], compte["A LA MAIN"]))
    return 0 if compte["ABSENT"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
