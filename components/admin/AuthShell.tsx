import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

/**
 * Gabarit des ecrans d'authentification du back-office (connexion, 2FA, mot de
 * passe). Ils vivent hors de la coquille du dashboard mais doivent porter la
 * meme marque : logo BLF Lab's et grille de paillasse en fond, carte centree.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-6 py-16">
      <span
        aria-hidden="true"
        className="grille pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <main className="relative w-full max-w-md">
        <Logo className="mb-6 h-12" />
        {children}
      </main>
    </div>
  );
}
