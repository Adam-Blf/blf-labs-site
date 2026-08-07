import { CtaBand } from "./CtaBand";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Methode } from "./Methode";
import { OffreGrid } from "./OffreGrid";
import { ReferencesSection } from "./ReferencesSection";

/**
 * Corps de la page d'accueil, isole de la page elle-meme pour rester
 * reutilisable (il a servi au comparateur de directions artistiques).
 *
 * Ordre des sections : ce qu'on fait, comment on le fait, la preuve que ca
 * marche, les objections, puis l'appel a l'action. Mettre la FAQ avant l'appel
 * a l'action est deliberé : elle leve les dernieres reserves juste avant le
 * bouton.
 */
export function HomeSections() {
  return (
    <>
      <Hero />
      <OffreGrid />
      <Methode />
      <ReferencesSection compact />
      <Faq />
      <CtaBand />
    </>
  );
}
