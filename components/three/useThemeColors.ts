"use client";

import { useEffect, useState } from "react";

/**
 * Couleurs de la scène, lues sur les jetons de thème du site.
 *
 * Aucune couleur n'est écrite en dur ici, et c'est le point important. La barre
 * de navigation du site a déjà connu ce bug : un fond en `rgba(255,255,255,...)`
 * écrit en dur peignait du blanc sur du blanc en thème clair, et sa limite
 * disparaissait. Une scène 3D qui figerait ses couleurs referait la même faute,
 * en pire, parce qu'un canvas ne se corrige pas avec une règle CSS.
 *
 * Les valeurs sont relues à chaque bascule de thème : la classe `.dark` est
 * posée sur `<html>` par le script d'amorçage du layout, on observe donc cet
 * attribut plutôt que `prefers-color-scheme`, qui ne reflète pas la bascule
 * manuelle du site.
 */
export type SceneColors = {
  /** Aplat principal du liquide. Vient du logo. */
  violet: string;
  /** Accent secondaire, sur les gouttes. */
  citron: string;
  /** Fond de page. Ce que la paroi laisse voir à travers elle. S'inverse. */
  paper: string;
  /** Encre du texte. S'inverse. */
  ink: string;
  /**
   * Blanc de marque, INVARIANT d'un thème à l'autre.
   *
   * C'est la couleur des sources lumineuses de la scène, et la raison tient en
   * une phrase : une lampe ne change pas de couleur quand on éteint le plafond.
   * Une première version éclairait avec `--paper`, qui passe au quasi-noir en
   * thème sombre : la fiole devenait une silhouette noire et le liquide
   * disparaissait. C'est exactement la faute que le projet a déjà documentée
   * pour `--accent-ink`, transposée à un éclairage.
   */
  neige: string;
};

const FALLBACK: SceneColors = {
  violet: "#cb6ce6",
  citron: "#d9fb50",
  paper: "#f7f7fa",
  ink: "#111016",
  neige: "#edeef1",
};

export function useThemeColors(): SceneColors {
  const [colors, setColors] = useState<SceneColors>(FALLBACK);

  useEffect(() => {
    const root = document.documentElement;

    function read() {
      const style = getComputedStyle(root);
      setColors({
        violet: pick(style, "--violet", FALLBACK.violet),
        citron: pick(style, "--citron", FALLBACK.citron),
        paper: pick(style, "--paper", FALLBACK.paper),
        ink: pick(style, "--ink", FALLBACK.ink),
        neige: pick(style, "--neige", FALLBACK.neige),
      });
    }

    read();

    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

/**
 * Une variable absente rend une chaîne vide, que three interprète comme du noir.
 * On retombe donc explicitement sur la valeur de secours plutôt que de laisser
 * passer un noir silencieux.
 */
function pick(
  style: CSSStyleDeclaration,
  name: string,
  fallback: string,
): string {
  const value = style.getPropertyValue(name).trim();
  return value.length > 0 ? value : fallback;
}
