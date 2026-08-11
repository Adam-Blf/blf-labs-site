/**
 * Articles du journal.
 *
 * CE FICHIER EST VOLONTAIREMENT VIDE.
 *
 * Un journal sans article est une page vide, et une page vide indexee vaut
 * moins que pas de page du tout : Google la traite comme du contenu mince et
 * la penalisation deborde sur le reste du domaine.
 *
 * D'ou le comportement de la route `/journal` : tant que ce tableau est vide,
 * elle repond 404 et n'apparait ni dans le sitemap, ni dans le pied de page.
 * Le premier article publie l'active, sans rien avoir a rebrancher.
 *
 * POURQUOI UN JOURNAL. C'est le seul actif de referencement cumulatif d'un
 * site de prestation : les pages commerciales se classent sur quelques
 * requetes, un article se classe sur les questions que se posent les gens
 * avant d'acheter. Il alimente ensuite les pages secteurs et le comparatif.
 *
 * REGLE DE REDACTION : un article par question reellement posee en clientele.
 * Pas de billet d'actualite sur une sortie de framework, personne ne cherche
 * ca chez un prestataire.
 */
export type Article = {
  slug: string;
  titre: string;
  /** Une phrase, celle qui sert de meta description. */
  resume: string;
  /** Date de publication au format ISO, pour le tri et le balisage. */
  date: string;
  /** Duree de lecture en minutes, honnete. */
  lecture: number;
  /** Le corps, en paragraphes. Le premier sert d'accroche. */
  corps: string[];
};

export const ARTICLES: Article[] = [];

export const ARTICLE_PAR_SLUG = new Map(
  ARTICLES.map((article) => [article.slug, article]),
);
