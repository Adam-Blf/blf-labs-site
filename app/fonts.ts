import localFont from "next/font/local";

/**
 * Archivo, police unique du site, variable sur deux axes.
 *
 * Le choix decoule du logo et non d'un gout : le lettrage de "BLF Lab's" est
 * trace sur une grille carree, fûts droits et terminaisons a angle droit.
 * Archivo a le meme squelette, si bien qu'un titre de page et le logo pose
 * au-dessus se lisent comme sortis de la meme main.
 *
 * L'axe de largeur (wdth 62 -> 125) est la raison principale du choix : il
 * donne des titres larges et compacts qu'aucune police a chasse fixe ne peut
 * produire. C'est lui qui signe les pages, sans recourir a un effet visuel.
 *
 * Rapatriee dans public/fonts par scripts/fetch_fonts.py plutot que servie
 * depuis Google Fonts : aucune requete ne part vers un tiers au chargement.
 *
 * Une seule famille, volontairement. Les etiquettes et les numeros legaux sont
 * composes en capitales espacees dans cette meme Archivo, pas dans une
 * monospace : cela evite d'introduire une seconde voix typographique, et cela
 * ferme la porte au zero pointe qui avait fait rejeter Space Mono.
 */
export const sans = localFont({
  src: [
    {
      path: "../public/fonts/archivo-400-900-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});
