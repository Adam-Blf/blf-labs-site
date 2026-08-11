"use client";

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
 */
export function ThemeToggle() {
  // `null` tant que le navigateur n'a pas repondu : le serveur ne connait pas
  // la classe, et c'est ce qui evite une divergence d'hydratation.
  const sombre = useThemeSombre();
  const dark = sombre ?? false;

  return (
    <button
      type="button"
      onClick={() => basculerTheme(!dark)}
      aria-label={dark ? "Passer en theme clair" : "Passer en theme sombre"}
      aria-pressed={sombre ?? undefined}
      className="blk-sm flex h-11 w-11 items-center justify-center bg-surface text-ink transition-transform hover:-translate-y-[2px]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
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
      </svg>
    </button>
  );
}
