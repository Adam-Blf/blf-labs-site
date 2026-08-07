import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "accent" | "support" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 border-[3px] border-line px-6 py-3 font-display text-base font-bold uppercase tracking-wide transition-transform duration-150 min-h-[44px] " +
  // Ombre dure decalee, elle se resorbe au survol : le bouton "s'enfonce".
  "shadow-[5px_5px_0_0_var(--line)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_var(--line)] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none";

// Le texte pose sur un aplat utilise TOUJOURS l'encre invariante de cet aplat,
// jamais var(--ink) : c'est ce qui evite le quasi-blanc sur jaune en sombre.
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
