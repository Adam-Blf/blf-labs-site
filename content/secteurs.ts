/**
 * Pages par secteur d'activite.
 *
 * CE FICHIER EST VOLONTAIREMENT VIDE.
 *
 * Une page secteur credible s'appuie sur des projets reellement livres dans ce
 * secteur, avec son vocabulaire et ses contraintes. Ecrite sans cette matiere,
 * elle sonne creux et se repere immediatement : c'est le genre de page qui
 * fait douter du reste du site.
 *
 * La route `/secteurs/[slug]` ne genere donc aucune page tant que ce tableau
 * est vide.
 *
 * QUAND LA REMPLIR. Des le deuxieme projet livre dans un meme secteur. A ce
 * moment-la vous avez deux choses qu'aucun concurrent generaliste n'a : le
 * vocabulaire exact des clients de ce secteur, et deux references a citer.
 *
 * REGLE : ne jamais creer un secteur "au cas ou". Une page secteur sans
 * reference dans ce secteur ne se classe pas et n'inspire pas confiance.
 */
export type Secteur = {
  slug: string;
  /** Nom du secteur tel que ses acteurs le disent. */
  nom: string;
  /** Le probleme recurrent de ce secteur, en une phrase. */
  probleme: string;
  /** Ce que le studio y a deja livre. Vide interdit. */
  reponse: string[];
  /** Slugs des realisations de content/references.ts a citer. */
  references: string[];
};

export const SECTEURS: Secteur[] = [];
