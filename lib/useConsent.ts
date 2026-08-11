"use client";

import { useSyncExternalStore } from "react";
import {
  EVENEMENT_CONSENTEMENT,
  lireConsentement,
  type Consentement,
} from "./consent";

/**
 * Lecture reactive du consentement.
 *
 * `useSyncExternalStore` plutot qu'un `useEffect` qui appelle `setState` :
 * le consentement vit dans le stockage local, c'est-a-dire dans un magasin
 * exterieur a React. C'est precisement le cas que cette API traite. La version
 * precedente lisait le stockage dans un effet et posait l'etat dans la foulee,
 * ce que React signale comme un rendu en cascade, et qui obligeait chaque
 * composant a repeter le meme abonnement.
 *
 * Le serveur renvoie `null`, et non "inconnu". La nuance porte tout le
 * comportement d'affichage : "inconnu" signifie que le visiteur n'a pas encore
 * repondu, donc qu'il faut lui montrer le bandeau, alors que `null` signifie
 * qu'on ne sait pas encore ce qu'il a repondu. Rendre le bandeau cote serveur
 * le ferait apparaitre puis disparaitre chez quelqu'un qui a deja refuse.
 *
 * L'abonnement ecoute aussi `storage` : accepter dans un onglet met les autres
 * onglets a jour, au lieu de les laisser sur un etat perime.
 */
export function useConsentement(): Consentement | null {
  return useSyncExternalStore(sAbonner, lireCote, lireCoteServeur);
}

function sAbonner(rappel: () => void): () => void {
  window.addEventListener(EVENEMENT_CONSENTEMENT, rappel);
  window.addEventListener("storage", rappel);

  return () => {
    window.removeEventListener(EVENEMENT_CONSENTEMENT, rappel);
    window.removeEventListener("storage", rappel);
  };
}

/**
 * Renvoie une chaine, donc une valeur comparee par identite sans risque de
 * boucle : `useSyncExternalStore` reappelle cette fonction a chaque rendu et
 * boucle a l'infini si elle rend un nouvel objet a chaque fois.
 */
function lireCote(): Consentement {
  return lireConsentement();
}

function lireCoteServeur(): null {
  return null;
}
