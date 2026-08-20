import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { signOutAdmin } from "../auth-actions";

/**
 * Coquille du back-office et DERNIERE barriere avant les donnees. Le proxy a
 * deja aiguille, mais on re-verifie ici cote serveur : pas de session ou session
 * non aal2 => on renvoie a la connexion. RLS reste la garantie ultime en base.
 *
 * Les ecrans d'authentification (login, 2fa) ont leur propre mise en page plein
 * ecran et ne passent pas par cette coquille.
 */

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await supabaseServer();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") redirect("/admin/login");

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      {/* Grille de paillasse : la matiere du site BLF Lab's, posee en fond pour
          que le back-office appartienne visiblement a la meme marque. Decorative,
          donc masquee aux lecteurs d'ecran. */}
      <span
        aria-hidden="true"
        className="grille pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />

      <header className="relative border-b border-line bg-paper/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="BLF Lab's - retour à l'accueil">
                <Logo className="h-8" />
              </Link>
              <span className="mono hidden text-[0.7rem] text-muted sm:inline">
                Back-office
              </span>
            </div>
            <AdminNav />
          </div>
          <div className="flex items-center gap-4 text-sm">
            {/*
              LA BASCULE DE THEME EXISTAIT MAIS N'ETAIT PAS ICI. Elle vivait
              dans l'en-tete du site public seulement, alors qu'un back-office
              se tient souvent tard et longtemps - c'est l'ecran qui en a le
              plus besoin, et c'etait le seul a ne pas l'avoir.
            */}
            <ThemeToggle />
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <form action={signOutAdmin}>
              <button className="text-muted transition-colors hover:text-ink">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
