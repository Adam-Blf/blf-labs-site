"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "reicon-react";
import { basculerTheme, useThemeSombre } from "@/lib/ui/useTheme";

/**
 * Bascule clair / sombre.
 *
 * Les pictogrammes viennent de Reicon (reicon-react), embarques dans le bundle :
 * aucune requete sortante, et le trace suit `currentColor`.
 *
 * L'etat n'est pas duplique dans React : il est lu directement sur la classe
 * `.dark` de `<html>`, seule source de verite, posee avant le premier rendu par
 * le script d'amorcage du layout. Le composant ne peut donc pas afficher un
 * soleil pendant que la page est sombre.
 *
 * Le pictogramme pivote et se fond au changement (framer-motion), ce qui rend la
 * bascule intentionnelle. La rotation est coupee pour `prefers-reduced-motion`.
 * C'est un bouton d'ACTION dont le libelle change ("Passer en thème sombre/clair")
 * : on ne lui met donc pas d'`aria-pressed`, qui doublerait l'encodage de l'etat.
 */
export function ThemeToggle() {
  // `null` tant que le navigateur n'a pas repondu : le serveur ne connait pas
  // la classe, et c'est ce qui evite une divergence d'hydratation.
  const sombre = useThemeSombre();
  const dark = sombre ?? false;
  const reduit = useReducedMotion();
  const libelle = dark ? "Passer en thème clair" : "Passer en thème sombre";

  return (
    <button
      type="button"
      onClick={() => basculerTheme(!dark)}
      aria-label={libelle}
      title={libelle}
      className="blk-sm relative flex h-11 w-11 items-center justify-center overflow-hidden bg-surface text-ink transition-transform hover:-translate-y-[2px]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "lune" : "soleil"}
          className="flex"
          aria-hidden="true"
          initial={reduit ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.6 }}
          animate={reduit ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
          exit={reduit ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: reduit ? 0.12 : 0.22, ease: "easeOut" }}
        >
          {dark ? (
            <Moon strokeWidth={2.5} className="h-5 w-5" />
          ) : (
            <Sun strokeWidth={2.5} className="h-5 w-5" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
