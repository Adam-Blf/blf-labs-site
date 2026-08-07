import localFont from "next/font/local";

/**
 * Polices auto-hebergees depuis public/fonts (voir scripts/fetch_fonts.py).
 * Aucun appel a un CDN : le site doit s'afficher a l'identique sur un poste
 * sans acces internet sortant.
 *
 * Cinq familles sont chargees le temps de la comparaison des directions
 * artistiques. Une fois la direction choisie, celles qui ne servent plus sont
 * retirees d'ici ET de scripts/fetch_fonts.py : garder cinq polices en
 * production couterait environ 150 Ko pour rien.
 *
 * Aucune police "par defaut" (ni Inter, ni Roboto, ni Arial), ni Anton (deja la
 * signature de Bacchana), ni IBM Plex / JetBrains Mono.
 */

// Grotesque a fort caractere, axe de poids variable 400 -> 800.
export const display = localFont({
  src: [
    {
      path: "../public/fonts/bricolage-grotesque-400-800-latin.woff2",
      weight: "400 800",
      style: "normal",
    },
  ],
  variable: "--font-bricolage",
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

// Serif d'affichage pour les directions editoriales.
export const serif = localFont({
  src: [
    {
      path: "../public/fonts/instrument-serif-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// Grotesque affichiste, tres grasse et tres large.
export const poster = localFont({
  src: [
    {
      path: "../public/fonts/archivo-black-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-poster",
  display: "swap",
  fallback: ["Impact", "sans-serif"],
});
