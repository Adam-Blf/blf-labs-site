import type { ReactNode } from "react";

/**
 * Bloc neobrutaliste : trait epais, ombre dure decalee, aucun degrade.
 * `tone` change le fond, jamais l'epaisseur du trait : c'est le trait qui fait
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

  return (
    <div
      className={`border-[3px] border-line shadow-[6px_6px_0_0_var(--line)] ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
