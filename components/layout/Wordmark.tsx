import { Logo } from "@/components/brand/Logo";

/**
 * Signature de marque utilisee dans l'en-tete et le pied de page.
 *
 * Enveloppe le logo pour que la taille et le texte alternatif soient definis a
 * un seul endroit : si le dessin change, rien d'autre ne bouge.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return <Logo className={`h-10 w-auto text-ink ${className}`} />;
}
