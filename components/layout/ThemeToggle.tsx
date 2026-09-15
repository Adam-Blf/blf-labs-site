"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { basculerTheme, useThemeSombre } from "@/lib/ui/useTheme";

/**
 * Bascule clair / sombre.
 *
 * L'etat n'est pas duplique dans React : il est lu directement sur la classe
 * `.dark` de `<html>`, seule source de verite, posee avant le premier rendu par
 * le script d'amorcage du layout. Le composant ne peut donc pas afficher un
 * soleil pendant que la page est sombre.
 *
 * Les deux pictogrammes (Phosphor) sont TOUJOURS rendus, superposes, et c'est
 * le CSS qui les echange en fondu, legere rotation et flou de 2 px. La version
 * precedente animait un seul SVG avec framer-motion en choisissant ses valeurs
 * selon `useReducedMotion()` : le serveur, qui ne connait pas la preference,
 * rendait la rotation, le navigateur d'un visiteur en mouvement reduit rendait
 * un simple fondu, et React levait une erreur d'hydratation sur chaque page. En
 * CSS, le rendu serveur et client est identique, et le bloc
 * `prefers-reduced-motion` de globals.css neutralise la duree.
 *
 * C'est un bouton d'ACTION dont le libelle change ("Passer en thème sombre/clair")
 * : on ne lui met donc pas d'`aria-pressed`, qui doublerait l'encodage de l'etat.
 */
const ICONE =
  "absolute h-5 w-5 transition-[opacity,transform,filter] duration-200 ease-snap";
const VISIBLE = "opacity-100 rotate-0 scale-100 blur-0";
const CACHEE = "opacity-0 scale-75 blur-[2px]";

export function ThemeToggle() {
  // `null` tant que le navigateur n'a pas repondu : le serveur ne connait pas
  // la classe, et c'est ce qui evite une divergence d'hydratation.
  const sombre = useThemeSombre();
  const dark = sombre ?? false;
  const libelle = dark ? "Passer en thème clair" : "Passer en thème sombre";

  return (
    <button
      type="button"
      onClick={() => basculerTheme(!dark)}
      aria-label={libelle}
      title={libelle}
      className="blk-sm relative flex h-11 w-11 items-center justify-center overflow-hidden bg-surface text-ink transition-transform duration-150 ease-snap hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.97]"
    >
      <SunIcon
        aria-hidden="true"
        weight="bold"
        className={`${ICONE} ${dark ? `${CACHEE} rotate-90` : VISIBLE}`}
      />
      <MoonIcon
        aria-hidden="true"
        weight="bold"
        className={`${ICONE} ${dark ? VISIBLE : `${CACHEE} -rotate-90`}`}
      />
    </button>
  );
}
