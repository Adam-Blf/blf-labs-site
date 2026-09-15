import localFont from "next/font/local";

/**
 * Barlow, en deux chasses, refonte du 2026-09-15.
 *
 * La direction du site est une signaletique de ligne. Barlow a ete dessinee
 * d'apres les panneaux routiers et les plaques de transport californiens :
 * formes legerement arrondies, lettres ouvertes, chiffres francs. Elle se lit
 * de loin et vite, ce qu'on demande a un nom de station.
 *
 * Deux chasses d'une meme famille plutot que deux familles : la condensee porte
 * les placards (titres, noms de station, etiquettes), la normale porte le
 * texte. Un systeme de signaletique parle d'une seule voix.
 *
 * Fichiers rapatries dans public/fonts par scripts/fetch_fonts.py : aucune
 * requete ne part vers un tiers au chargement. Police inscrite au registre au
 * nom de blf-labs-site.
 */
export const texte = localFont({
  src: [
    { path: "../public/fonts/barlow-400-latin.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/barlow-500-latin.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/barlow-600-latin.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/barlow-700-latin.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

export const placard = localFont({
  src: [
    { path: "../public/fonts/barlow-condensed-600-latin.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/barlow-condensed-700-latin.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/barlow-condensed-800-latin.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});
