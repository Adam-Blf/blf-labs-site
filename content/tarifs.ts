/**
 * Fourchettes de budget affichees publiquement.
 *
 * CE FICHIER EST VOLONTAIREMENT VIDE.
 *
 * Un montant affiche engage l'entreprise. Il doit venir d'Adam, pas d'une
 * estimation plausible : c'est la regle deja posee dans `content/faq.ts`, et
 * elle vaut d'autant plus ici que c'est le premier filtre du visiteur.
 *
 * La page /tarifs existe et explique COMMENT un prix se construit, ce qui est
 * vrai et verifiable aujourd'hui. Le tableau des fourchettes, lui, ne
 * s'affiche que quand ce tableau est rempli. Une page tarifs avec des chiffres
 * inventes est pire que pas de page du tout : le premier devis qui les
 * contredit detruit la confiance au moment ou elle compte le plus.
 *
 * POUR REMPLIR, il faut pour chaque ligne :
 *   - un plancher reel, celui en dessous duquel la prestation est refusee ;
 *   - ce que ce plancher couvre exactement ;
 *   - ce qui fait monter le prix.
 */
export type Fourchette = {
  /** Doit correspondre au slug d'une offre de content/offres.ts. */
  offre: string;
  /** Plancher affiche, par exemple "a partir de 2 500 EUR". */
  plancher: string;
  /** Ce que ce plancher couvre, en une phrase. */
  couvre: string;
  /** Ce qui fait monter le prix, en une phrase. */
  fait_monter: string;
};

export const FOURCHETTES: Fourchette[] = [];
