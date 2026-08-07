import { Logo } from "@/components/brand/Logo";

/**
 * Signature de marque utilisee dans l'en-tete et le pied de page.
 *
 * Enveloppe le logo pour que la taille et le texte alternatif soient definis a
 * un seul endroit : si le dessin change, rien d'autre ne bouge.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  // Le fichier de logo est carre et le lettrage n'occupe qu'une partie de sa
  // hauteur : a 40 px de haut, le mot "Lab's" tombait sous le seuil de
  // lisibilite. La hauteur tient compte de ce vide autour du dessin plutot que
  // de la seule boite du fichier.
  return <Logo className={`h-16 w-auto text-ink ${className}`} />;
}
