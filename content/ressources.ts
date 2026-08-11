/**
 * Ressources telechargeables.
 *
 * CE FICHIER EST VOLONTAIREMENT VIDE.
 *
 * Une page ressources sans ressource est une page vide, penalisee comme du
 * contenu mince. La route `/ressources` repond donc 404 tant que ce tableau
 * l'est, et n'apparait ni au sitemap ni au pied de page.
 *
 * A QUOI CA SERT. Capter les visiteurs qui ne sont pas prets a commander mais
 * qui ont un besoin reel : un modele de cahier des charges, une liste de
 * verification avant refonte, un comparatif d'hebergeurs. Ils reviennent
 * quand ils sont prets, et ils reviennent chez celui qui les a aides.
 *
 * REGLE : une ressource doit etre utilisable SANS le studio. Un document qui
 * ne sert qu'a decouvrir qu'on a besoin d'un prestataire est une publicite
 * deguisee, et ca se voit.
 *
 * PAS DE MUR D'EMAIL. Echanger un document contre une adresse est un
 * traitement de donnees personnelles avec sa base legale, son consentement et
 * sa duree de conservation. Pour le volume concerne, le telechargement libre
 * coute moins cher et rapporte plus de confiance.
 */
export type Ressource = {
  slug: string;
  titre: string;
  /** Ce que le document permet de faire, concretement. */
  utilite: string;
  /** Chemin du fichier dans public/ressources. */
  fichier: string;
  /** Format affiche, par exemple "PDF, 4 pages". */
  format: string;
};

export const RESSOURCES: Ressource[] = [];
