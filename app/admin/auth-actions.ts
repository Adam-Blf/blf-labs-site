"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminEmails } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabase-server";

export type LoginState = { error?: string; sent?: boolean };

/**
 * Envoi du lien magique, facteur 1 de la double authentification.
 *
 * La liste blanche est verifiee cote serveur avant d'envoyer quoi que ce soit :
 * un email hors whitelist ne recoit aucun lien et n'apprend rien de l'existence
 * du back-office (meme message neutre). Meme si un compte etait cree, RLS
 * (is_blf_admin) lui refuserait toute donnee.
 */
export async function requestAdminLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Renseigne ton adresse email." };

  const allowed = adminEmails();
  if (allowed.length > 0 && !allowed.includes(email)) {
    // Reponse volontairement identique au cas nominal.
    return { sent: true };
  }

  const supabase = await supabaseServer();
  if (!supabase) return { error: "Base de donnees indisponible." };

  const origin = (await headers()).get("origin") ?? "";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/admin/auth/callback` },
  });
  if (error) return { error: "Envoi impossible. Réessaie dans un instant." };

  return { sent: true };
}

/** Deconnexion complete du back-office. */
export async function signOutAdmin(): Promise<void> {
  const supabase = await supabaseServer();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
