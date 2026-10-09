import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "accent" | "support" | "ghost";

/**
 * Le style du bouton (trait, rayon, ombre) vient entierement de la direction
 * artistique active via `blk-sm`. Seule la couleur de fond est choisie ici.
 *
 * Le leger soulevement au survol est volontairement neutre : un effet
 * "d'enfoncement" ne fonctionne qu'avec une ombre dure et paraitrait casse sur
 * les directions sans ombre.
 */
const BASE =
  "blk-sm title inline-flex min-h-[44px] items-center justify-center gap-2 px-6 py-3 text-base " +
  "transition-transform duration-150 hover:-translate-y-[2px] active:translate-y-0";

// Le texte pose sur un aplat utilise TOUJOURS l'encre invariante de cet aplat,
// jamais var(--ink) : c'est ce qui evite le quasi-blanc sur jaune en sombre.
// Les aplats colores l'emportent desormais sur le fond de `blk-sm` grace au
// passage de `.blk*` en @layer components (voir globals.css) : plus besoin de
// forcer avec `!`.
const VARIANTS: Record<Variant, string> = {
  accent: "bg-accent text-accent-ink",
  support: "bg-support text-support-ink",
  ghost: "bg-surface text-ink",
};

type Props = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export function ButtonLink({
  variant = "accent",
  children,
  className = "",
  ...props
}: Props & ComponentProps<typeof Link>) {
  return (
    <Link className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "accent",
  children,
  className = "",
  ...props
}: Props & ComponentProps<"button">) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
