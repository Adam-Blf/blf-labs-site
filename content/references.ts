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
   * Capture du projet, dans public/shots. Produite par une capture du site en
   * ligne puis convertie en WebP (scripts/optimize_shots.py). Ce sont les
   * projets d'Adam : aucune image de tiers n'est reprise.
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
    slug: "ohypnozen",
    title: "Ohypnozen",
    role: "Site vitrine livré pour un cabinet de thérapie",
    summary:
      "Site de présentation d'un cabinet : prestations, prise de contact, contenus modifiables par la praticienne sans passer par un développeur.",
    url: "https://ohypnozen.com",
    shot: "/shots/ohypnozen.webp",
    facts: [
      "Interface d'édition réservée à la propriétaire du site",
      "Pages légales et RGPD en place dès la mise en ligne",
      "Nom de domaine et hébergement au nom du cabinet",
    ],
    tags: ["Site vitrine", "Next.js", "Édition de contenu"],
  },
];
