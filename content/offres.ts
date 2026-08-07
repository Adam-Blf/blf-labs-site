/**
 * Les quatre familles de prestation du studio.
 *
 * Ce fichier alimente a la fois la grille de l'accueil, les pages /offre/[slug]
 * et la liste deroulante du formulaire de commande : un ajout d'offre se fait
 * ici et se propage partout.
 */

export type OffreSlug =
  | "sites-web"
  | "apps-web"
  | "apps-mobiles"
  | "data-ia";

export type Offre = {
  slug: OffreSlug;
  /** Numero affiche facon fiche technique. */
  index: string;
  title: string;
  /** Une ligne, celle qui tient dans la carte de l'accueil. */
  pitch: string;
  /** Deux ou trois phrases, en tete de la page dediee. */
  intro: string;
  /** Ce qui est concretement livre. */
  deliverables: string[];
  /** Outils reellement utilises, pas une liste de mots-cles. */
  stack: string[];
  /** Repere de delai, honnete, pas un engagement contractuel. */
  timeline: string;
};

export const OFFRES: Offre[] = [
  {
    slug: "sites-web",
    index: "01",
    title: "Sites et boutiques",
    pitch: "Un site qui charge vite, se tient sur mobile et vous appartient.",
    intro:
      "Site vitrine, page de lancement ou boutique en ligne. Vous repartez avec un site rapide, lisible sur telephone, indexe correctement, et dont vous gardez le code et le nom de domaine.",
    deliverables: [
      "Maquette validee avant la première ligne de code",
      "Site responsive, teste en clair et en sombre",
      "Pages légales conformes, RGPD compris",
      "Referencement technique et données structurées",
      "Interface pour modifier vos textes sans développeur",
    ],
    stack: ["Next.js", "Tailwind CSS", "Vercel", "Stripe"],
    timeline: "Deux à cinq semaines selon le nombre de pages",
  },
  {
    slug: "apps-web",
    index: "02",
    title: "Applications web et SaaS",
    pitch: "L'outil métier que votre tableur ne sait plus porter.",
    intro:
      "Quand le fichier partage atteint ses limites : comptes utilisateurs, droits d'accès, historique, tableau de bord. On modélise votre métier, puis on l'outille.",
    deliverables: [
      "Modele de données discute avec vos équipes",
      "Comptes, roles et droits verrouilles cote base",
      "Tableau de bord et exports",
      "Tests automatises sur les calculs sensibles",
      "Documentation d'exploitation",
    ],
    stack: ["Next.js", "PostgreSQL", "Supabase", "TypeScript"],
    timeline: "Un à trois mois selon le périmètre",
  },
  {
    slug: "apps-mobiles",
    index: "03",
    title: "Applications mobiles",
    pitch: "iOS et Android, jusqu'a la publication sur les stores.",
    intro:
      "Une application publiee sur l'App Store et Google Play, pas une demo. Le studio publie déjà ses propres applications, la partie pénible de la publication est déjà balisée.",
    deliverables: [
      "Application iOS et Android",
      "Fiches store, captures et textes de presentation",
      "Publication et suivi des validations",
      "Achats intégrés si le modèle economique en demande",
      "Mises à jour automatisees",
    ],
    stack: ["React Native", "Expo", "Kotlin", "SwiftUI"],
    timeline: "Deux à quatre mois, publication comprise",
  },
  {
    slug: "data-ia",
    index: "04",
    title: "Data, IA et automatisation",
    pitch: "Vos données rangees, vos taches repetitives supprimees.",
    intro:
      "Recuperer des données eparpillees, les nettoyer, les rendre lisibles. Automatiser ce qui se fait encore à la main. Brancher un modèle de langue quand il apporte vraiment quelque chose.",
    deliverables: [
      "Pipeline de collecte et de nettoyage",
      "Controles de qualité sur les données",
      "Tableau de bord decisionnel",
      "Automatisation des taches recurrentes",
      "Assistant de recherche documentaire si pertinent",
    ],
    stack: ["Python", "PostgreSQL", "BigQuery", "RAG"],
    timeline: "Trois semaines à deux mois",
  },
];

export const OFFRE_BY_SLUG = new Map(OFFRES.map((offre) => [offre.slug, offre]));
