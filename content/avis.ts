/**
 * Avis clients affiches sur le site.
 *
 * CE FICHIER EST VOLONTAIREMENT VIDE.
 *
 * Aucun avis n'est invente, aucun texte de remplissage n'est laisse ici "en
 * attendant". Deux raisons, et la premiere suffit :
 *
 * 1. Un faux avis est une pratique commerciale trompeuse (article L121-2 du
 *    code de la consommation). La DGCCRF sanctionne, et l'amende se compte en
 *    pourcentage du chiffre d'affaires.
 * 2. Un texte de remplissage finit toujours par partir en production. Un
 *    fichier vide, non.
 *
 * La section ne s'affiche pas tant que ce tableau est vide, et le balisage
 * `Review` / `AggregateRating` n'est pas emis non plus : Google penalise un
 * balisage d'avis sans avis visible correspondant.
 *
 * POUR AJOUTER UN AVIS, il faut trois choses :
 *   - le texte exact, mot pour mot, sans reecriture ;
 *   - le nom sous lequel la personne accepte d'apparaitre ;
 *   - son accord ecrit, conserve hors du depot.
 *
 * La note est facultative. Si vous en mettez une, elle doit venir de la
 * personne, pas d'une appreciation maison.
 */
export type Avis = {
  /** Texte de l'avis, mot pour mot. */
  texte: string;
  /** Nom sous lequel la personne accepte d'apparaitre. */
  auteur: string;
  /** Fonction et organisation, si la personne l'accepte. */
  role?: string;
  /** Note sur 5, uniquement si la personne l'a donnee. */
  note?: number;
  /** Date de l'avis, au format ISO. Sert au balisage. */
  date?: string;
};

export const AVIS: Avis[] = [];
