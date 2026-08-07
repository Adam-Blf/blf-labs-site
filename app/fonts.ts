import localFont from "next/font/local";

/**
 * Outfit, police unique du site, en axe variable 300 -> 900.
 *
 * Rapatriee dans public/fonts par scripts/fetch_fonts.py plutot que chargee
 * depuis Google Fonts : aucune requete ne part vers un tiers au chargement, la
 * page s'affiche a l'identique sur un poste sans acces sortant, et il n'y a pas
 * de saut de rendu le temps du telechargement.
 */
export const sans = localFont({
  src: [
    {
      path: "../public/fonts/outfit-300-900-latin.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});
