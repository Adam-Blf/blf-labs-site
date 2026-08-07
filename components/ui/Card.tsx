import type { ReactNode } from "react";

/**
 * Bloc de contenu. Trait, rayon et ombre viennent de la direction artistique
 * active : la meme carte devient un pave brutaliste, une carte bento arrondie ou
 * un simple filet editorial sans changer une ligne ici.
 *
 * `tone` change le fond, jamais la structure : c'est la structure qui fait
 * l'unite visuelle du site.
 */
export function Card({
  children,
  tone = "surface",
  className = "",
}: {
  children: ReactNode;
  tone?: "surface" | "accent" | "support" | "paper";
  className?: string;
}) {
  const tones = {
    surface: "bg-surface text-ink",
    paper: "bg-paper text-ink",
    accent: "bg-accent text-accent-ink",
    support: "bg-support text-support-ink",
  } as const;

  return <div className={`blk ${tones[tone]} ${className}`}>{children}</div>;
}
