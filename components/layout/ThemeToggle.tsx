"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { basculerTheme, useThemeSombre } from "@/lib/useTheme";

/**
 * Bascule clair / sombre.
 *
 * Les pictogrammes sont dessines ici en SVG inline plutot qu'importes d'une
 * banque d'icones : un PNG servi par un CDN violerait la regle d'assets locaux
 * et ne suivrait pas la couleur du theme.
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
        <motion.svg
          key={dark ? "lune" : "soleil"}
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
          initial={reduit ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.6 }}
          animate={reduit ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
          exit={reduit ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: reduit ? 0.12 : 0.22, ease: "easeOut" }}
        >
          {dark ? (
            // Croissant : un disque evide par un second disque decale.
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1" />
            </>
          )}
        </motion.svg>
      </AnimatePresence>
    </button>
  );
}
