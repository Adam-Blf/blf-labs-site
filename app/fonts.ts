import localFont from "next/font/local";

/**
 * Polices auto-hebergees depuis public/fonts (voir scripts/fetch_fonts.py).
 * Aucun appel a un CDN : le site s'affiche a l'identique sur un poste sans acces
 * internet sortant, et aucune requete ne part chez Google au chargement.
 *
 * Choix revise le 2026-08-07. Space Grotesk et Space Mono ont ete ecartees :
 * leur zero porte un point central, signature trop reconnaissable qui donnait au
 * site l'air d'un gabarit genere. La paire actuelle a des chiffres ordinaires et
 * des lettres caracterisees, ce qui est exactement l'inverse de ce qu'on veut
 * eviter.
 *
 * Aucune police "par defaut" non plus (ni Inter, ni Roboto, ni Arial), ni Anton
 * (deja la signature de Bacchana), ni IBM Plex / JetBrains Mono.
 */

// Titres. Variable 400 -> 800, dessin contraste et legerement irregulier.
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

// Texte courant et etiquettes. Variable 400 -> 700, tres lisible en petit corps.
export const sans = localFont({
  src: [
    {
      path: "../public/fonts/hanken-grotesk-400-700-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});
