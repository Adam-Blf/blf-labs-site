/**
 * Realisations affichees publiquement.
 *
 * Regle : uniquement des projets en ligne, verifies accessibles, et dont l'URL
 * a ete controlee au moment de l'ecriture.
 *
 * Piege sur cette fiche : le nom s'ecrit bien "ohypnozen", AVEC le "p". Une
 * version precedente de ce commentaire affirmait le contraire et la fiche
 * portait "ohynozen", ce qui affichait publiquement le nom d'une cliente mal
 * orthographie. Les deux domaines repondent, mais le titre du site lui-meme
 * dit "ohypnozen", et c'est lui qui fait foi. L'extension est ".com", le ".fr"
 * ne repond pas. Verifie par requete, pas de memoire.
 *
 * Aucun projet hospitalier ici : donnees de sante, hors ligne par nature.
 */

export type Reference = {
  slug: string;
  title: string;
  role: string;
  summary: string;
  url: string;
  /**
   * Capture du projet, dans public/shots. Produite par scripts/capture_shots.py,
   * qui ouvre le site en ligne, ecarte le guide d'introduction et le bandeau de
   * consentement, puis convertit en WebP. Ces deux ecrans avaient fini par etre
   * tout ce que la vitrine montrait des projets : une capture prise au premier
   * chargement ne prouve rien. Ce sont les projets d'Adam : aucune image de
   * tiers n'est reprise.
   */
  shot: string;
  /** Ce que le projet prouve concretement, pas un adjectif. */
  facts: string[];
  tags: string[];
};

export const REFERENCES: Reference[] = [
  {
    slug: "bacchana",
    title: "Bacchana",
    role: "Produit du studio, de la conception à la publication",
    summary:
      "Jeu de soirée conçu, développé et édité par le studio. Application web installable, plus une version iOS et une version Android construites à parité.",
    url: "https://bacchana.beloucif.com",
    shot: "/shots/bacchana.webp",
    facts: [
      "Trois plateformes maintenues en parallèle",
      "Achats intégrés et mesure d'audience avec consentement",
      "Suivi des erreurs et tableau de bord produit en place",
    ],
    tags: ["Produit", "Web", "iOS", "Android"],
  },
  {
    /*
     * CETTE FICHE DISAIT « SITE VITRINE », ET C'ETAIT LA MOITIE DE LA VERITE.
     *
     * Le site prend des rendez-vous, gere des creneaux, envoie des rappels et
     * encaisse. Le decrire comme un site de presentation etait une modestie qui
     * coutait cher : la prospection ecrit « vos clients ne peuvent ni prendre
     * rendez-vous ni payer », et le lecteur qui cliquait pour verifier tombait
     * sur une preuve qui ne montrait pas ca. Le message et la preuve doivent
     * parler du meme objet.
     *
     * Tout ce qui est ecrit ici tourne en production et se verifie en trois
     * clics sur ohypnozen.com.
     */
    slug: "ohypnozen",
    title: "Ohypnozen",
    role: "Prise de rendez-vous et paiement en ligne, pour un cabinet d'hypnose",
    summary:
      "Le patient choisit son créneau, reçoit un rappel automatique la veille et règle en ligne. La praticienne ne rappelle plus personne pour caler une date, et un créneau libéré se remet en ligne tout seul.",
    url: "https://ohypnozen.com",
    shot: "/shots/ohypnozen.webp",
    facts: [
      "Réservation en ligne avec gestion des créneaux et rappel automatique",
      "Paiement sécurisé, sur place ou à l'avance selon la séance",
      "Espace praticienne : rendez-vous, dossiers, créneaux bloqués",
      "Pages légales, RGPD et données de santé traitées dès la mise en ligne",
    ],
    tags: ["Réservation", "Paiement", "Next.js", "Espace praticien"],
  },
];
