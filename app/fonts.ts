import localFont from "next/font/local";

/**
 * Polices auto-hebergees depuis public/fonts (voir scripts/fetch_fonts.py).
 * Aucun appel a un CDN : le site doit s'afficher a l'identique sur un poste
 * sans acces internet sortant.
 *
 * Choix typographique : aucune police "par defaut" (pas d'Inter, Roboto, Arial),
 * et ni Anton (deja la signature de Bacchana) ni IBM Plex / JetBrains Mono.
 */

// Titres : grotesque a fort caractere, axe de poids variable 400 -> 800.
export const display = localFont({
  src: [
    {
      path: "../public/fonts/bricolage-grotesque-400-800-latin.woff2",
      weight: "400 800",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

// Texte courant : variable 400 -> 700, dessin geometrique un peu decale.
export const sans = localFont({
  src: [
    {
      path: "../public/fonts/space-grotesk-400-700-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
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
