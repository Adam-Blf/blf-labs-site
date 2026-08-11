"use client";

import { useSyncExternalStore } from "react";

export const CLE_THEME = "blf-theme";

/**
 * Lecture reactive du theme sombre.
 *
 * Le theme ne vit pas dans React : il vit dans la classe `.dark` posee sur
 * `<html>` par le script d'amorcage du layout, avant meme le premier rendu.
 * C'est donc un magasin exterieur, et `useSyncExternalStore` est l'API prevue
 * pour ca. La version precedente lisait la classe dans un effet puis posait
 * l'etat dans la foulee, ce que React signale comme un rendu en cascade.
 *
 * Le serveur renvoie `null` : il ne connait pas la classe. C'est ce qui evite
 * une divergence d'hydratation sur `aria-pressed`, sans avoir besoin d'un
 * drapeau `monte` maintenu a la main.
 *
 * L'observation porte sur l'attribut `class` de `<html>`, donc la bascule reste
 * juste meme si la classe est changee ailleurs que par ce composant.
 */
export function useThemeSombre(): boolean | null {
  return useSyncExternalStore(sAbonner, lireCote, lireCoteServeur);
}

export function basculerTheme(sombre: boolean) {
  document.documentElement.classList.toggle("dark", sombre);

  try {
    window.localStorage.setItem(CLE_THEME, sombre ? "dark" : "light");
  } catch {
    // Navigation privee ou stockage refuse : la bascule reste valable pour la
    // session en cours, ce n'est pas une erreur a remonter a l'utilisateur.
  }
}

function sAbonner(rappel: () => void): () => void {
  const observateur = new MutationObserver(rappel);
  observateur.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Un autre onglet a change le theme : on suit, plutot que d'afficher un etat
  // qui ne correspond plus a ce que le visiteur a choisi.
  window.addEventListener("storage", rappel);

  return () => {
    observateur.disconnect();
    window.removeEventListener("storage", rappel);
  };
}

function lireCote(): boolean {
  return document.documentElement.classList.contains("dark");
}

function lireCoteServeur(): null {
  return null;
}
