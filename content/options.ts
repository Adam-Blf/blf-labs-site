/**
 * Prestations complementaires proposees a la commande.
 *
 * Ce sont les postes facturables qui s'ajoutent au développement lui-meme, et
 * que le client oublie presque toujours au moment de son budget : le nom de
 * domaine, l'hebergement, la reprise de l'existant, le suivi. Les faire cocher
 * au moment de la demande evite la conversation pénible du devis ou l'on
 * decouvre que "le site" recouvrait dix choses non dites.
 *
 * AUCUN PRIX N'EST AFFICHE. Les montants engagent l'entreprise et doivent venir
 * d'Adam, pas d'une estimation plausible. Les options cochees sont transmises
 * dans la demande et chiffrees dans la réponse. Quand la grille tarifaire
 * existera, ajouter un champ `price` ici et l'afficher en face de chaque ligne.
 */

export type OptionSlug =
  | "nom-de-domaine"
  | "hebergement"
  | "reprise-existant"
  | "contenus"
  | "identite"
  | "référencement"
  | "formation"
  | "maintenance";

export type Option = {
  slug: OptionSlug;
  label: string;
  /** Ce que le poste recouvre concretement, en une phrase. */
  detail: string;
  /** Regroupement affiche dans le formulaire. */
  group: "Mise en ligne" | "Contenu" | "Après livraison";
};

export const OPTIONS: Option[] = [
  {
    slug: "nom-de-domaine",
    label: "Nom de domaine",
    detail:
      "Recherche, achat et configuration du nom, mis à votre nom. Le renouvellement annuel reste à votre charge.",
    group: "Mise en ligne",
  },
  {
    slug: "hebergement",
    label: "Hébergement et adresses email",
    detail:
      "Mise en place de l'hébergement et des adresses email à votre domaine, avec les accès qui vous reviennent.",
    group: "Mise en ligne",
  },
  {
    slug: "reprise-existant",
    label: "Reprise d'un site existant",
    detail:
      "Récupération des contenus, des liens et du référencement acquis, pour ne rien perdre au changement.",
    group: "Mise en ligne",
  },
  {
    slug: "contenus",
    label: "Redaction des contenus",
    detail:
      "Écriture des textes du site à partir d'un échange. Sans cette option, vous fournissez les textes.",
    group: "Contenu",
  },
  {
    slug: "identite",
    label: "Logo et identité visuelle",
    detail:
      "Création ou reprise du logo, choix des couleurs et des polices, déclinaisons pour vos supports.",
    group: "Contenu",
  },
  {
    slug: "référencement",
    label: "Référencement",
    detail:
      "Travail sur les mots-clés, les pages et la fiche Google, au-delà du référencement technique déjà compris.",
    group: "Contenu",
  },
  {
    slug: "formation",
    label: "Formation à l'édition",
    detail:
      "Une séance pour apprendre à modifier vos contenus vous-même, avec un mémo écrit.",
    group: "Après livraison",
  },
  {
    slug: "maintenance",
    label: "Maintenance mensuelle",
    detail:
      "Mises à jour, sauvegardes, surveillance et petites évolutions. Sans engagement de durée.",
    group: "Après livraison",
  },
];

export const OPTION_LABELS: Record<string, string> = Object.fromEntries(
  OPTIONS.map((option) => [option.slug, option.label]),
);

/** Ordre d'affichage des groupes dans le formulaire. */
export const OPTION_GROUPS = [
  "Mise en ligne",
  "Contenu",
  "Après livraison",
] as const;
