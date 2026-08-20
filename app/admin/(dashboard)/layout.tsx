import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { AdminNav } from "@/components/admin/AdminNav";
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
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4">
          <div className="flex items-center gap-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="BLF Lab's"
              width={92}
              height={66}
              className="h-8 w-auto"
            />
            <AdminNav />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <form action={signOutAdmin}>
              <button className="text-muted transition-colors hover:text-ink">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
