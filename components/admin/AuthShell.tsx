import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Gabarit des ecrans d'authentification du back-office (connexion, 2FA, mot de
 * passe). Ils vivent hors de la coquille du dashboard mais doivent porter la
 * meme marque : logo BLF Lab's et jetons du site, carte centree. La grille de
 * paillasse de l'ancienne direction a ete retiree avec elle le 2026-09-15.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-6 py-16">
      <main className="relative w-full max-w-md">
        <Link
          href="/"
          aria-label="BLF Lab's - retour à l'accueil"
          className="mb-6 inline-block"
        >
          <Logo className="h-12" />
        </Link>
        {children}
      </main>
    </div>
  );
}
