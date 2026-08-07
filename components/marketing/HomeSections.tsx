import { CtaBand } from "./CtaBand";
import { Hero } from "./Hero";
import { Methode } from "./Methode";
import { OffreGrid } from "./OffreGrid";
import { ReferencesSection } from "./ReferencesSection";

/**
 * Corps de la page d'accueil, isole de la page elle-meme.
 *
 * Raison d'etre : le comparateur de palettes (/design-preview) rejoue exactement
 * la meme page dans chaque palette. Sans ce composant, il faudrait dupliquer le
 * contenu et les trois maquettes divergeraient a la premiere retouche.
 */
export function HomeSections() {
  return (
    <>
      <Hero />
      <OffreGrid />
      <Methode />
      <ReferencesSection compact />
      <CtaBand />
    </>
  );
}
