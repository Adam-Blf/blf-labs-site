import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { signOutAdmin } from "../auth-actions";

/**
 * Coquille du back-office et DERNIERE barriere avant les donnees. Le proxy a
 * deja aiguille, mais on re-verifie ici cote serveur : pas de session ou session
 * non aal2 => on renvoie a la connexion. RLS reste la garantie ultime en base.
 *
 * Les ecrans d'authentification (login, 2fa) ont leur propre mise en page plein
 * ecran et ne passent pas par cette coquille.
 */
const NAV = [
  { href: "/admin", label: "Leads" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/facturation", label: "Facturation" },
];

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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="title text-lg">BLF Lab&apos;s</span>
            <nav className="flex gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="blk-sm bg-surface px-3 py-2 hover:-translate-y-[1px] transition-transform"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <form action={signOutAdmin}>
              <button className="blk-sm bg-surface px-3 py-2 text-ink hover:-translate-y-[1px] transition-transform">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
