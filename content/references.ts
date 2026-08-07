/**
 * Realisations affichees publiquement.
 *
 * Regle : uniquement des projets en ligne, verifies accessibles, et dont l'URL
 * a ete controlee au moment de l'ecriture.
 *
 * Deux pieges deja rencontres sur cette seule fiche : le nom s'ecrit "ohynozen"
 * sans "p", contrairement au nom du projet d'hebergement, et l'extension est
 * ".com" - le ".fr" ne repond pas. Verifie par requete, pas de memoire.
 *
 * Aucun projet hospitalier ici : donnees de sante, hors ligne par nature.
 */

export type Reference = {
  slug: string;
  title: string;
  role: string;
  summary: string;
  url: string;
  /** Ce que le projet prouve concretement, pas un adjectif. */
  facts: string[];
  tags: string[];
};

export const REFERENCES: Reference[] = [
  {
    slug: "bacchana",
    title: "Bacchana",
    role: "Produit du studio, de la conception a la publication",
    summary:
      "Jeu de soiree concu, developpe et edite par le studio. Application web installable, plus une version iOS et une version Android construites a parite.",
    url: "https://bacchana.beloucif.com",
    facts: [
      "Trois plateformes maintenues en parallele",
      "Achats integres et mesure d'audience avec consentement",
      "Suivi des erreurs et tableau de bord produit en place",
    ],
    tags: ["Produit", "Web", "iOS", "Android"],
  },
  {
    slug: "ohynozen",
    title: "Ohynozen",
    role: "Site vitrine livre pour un cabinet de therapie",
    summary:
      "Site de presentation d'un cabinet : prestations, prise de contact, contenus modifiables par la praticienne sans passer par un developpeur.",
    url: "https://ohynozen.com",
    facts: [
      "Interface d'edition reservee a la proprietaire du site",
      "Pages legales et RGPD en place des la mise en ligne",
      "Nom de domaine et hebergement au nom du cabinet",
    ],
    tags: ["Site vitrine", "Next.js", "Edition de contenu"],
  },
];
