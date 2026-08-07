"use client";

import { useEffect, useState } from "react";

/**
 * Bascule clair / sombre.
 *
 * Les pictogrammes sont dessines ici en SVG inline plutot qu'importes d'une
 * banque d'icones : un PNG servi par un CDN violerait la regle d'assets locaux
 * et ne suivrait pas la couleur du theme.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("blf-theme", next ? "dark" : "light");
    } catch {
      // Navigation privee ou stockage refuse : la bascule reste valable pour la
      // session en cours, ce n'est pas une erreur a remonter a l'utilisateur.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Passer en theme clair" : "Passer en theme sombre"}
      aria-pressed={mounted ? dark : undefined}
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
