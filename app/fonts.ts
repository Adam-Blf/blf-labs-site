import localFont from "next/font/local";

/**
 * Polices auto-hebergees depuis public/fonts (voir scripts/fetch_fonts.py).
 * Aucun appel a un CDN : le site doit s'afficher a l'identique sur un poste sans
 * acces internet sortant, et aucune requete ne doit partir chez Google au
 * chargement d'une page (c'est aussi un point RGPD).
 *
 * Deux familles seulement, 53 Ko au total. Aucune police "par defaut" (ni Inter,
 * ni Roboto, ni Arial), ni Anton (deja la signature de Bacchana), ni IBM Plex /
 * JetBrains Mono.
 */

// Titres et texte courant. Variable 400 -> 700, dessin geometrique un peu
// decale qui evite le rendu "police systeme".
export const sans = localFont({
  src: [
    {
      path: "../public/fonts/space-grotesk-400-700-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-grotesk",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

// Donnees, etiquettes techniques, numeros legaux.
export const mono = localFont({
  src: [
    {
      path: "../public/fonts/space-mono-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/space-mono-700-latin.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["Consolas", "monospace"],
});
