"use server";

import { redirect } from "next/navigation";
import { adminEmails } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabase-server";

export type LoginState = { error?: string };
export type PasswordState = { error?: string };

/** Mot de passe provisoire livre a la creation du compte. Interdit de le garder. */
const PROVISIONAL_PASSWORD = "123456789";

/**
 * Facteur 1 : email + mot de passe. Facteur 2 (TOTP) sur l'ecran suivant.
 *
 * La liste blanche est verifiee cote serveur : un email hors whitelist recoit le
 * meme message d'erreur neutre qu'un mot de passe faux, sans revelation. Meme si
 * une session etait obtenue, RLS (`is_blf_admin`, aal2 + email) refuserait toute
 * donnee.
 */
export async function signInAdmin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Renseigne ton email et ton mot de passe." };

  const allowed = adminEmails();
  if (allowed.length > 0 && !allowed.includes(email)) {
    return { error: "Identifiants invalides." };
  }

  const supabase = await supabaseServer();
  if (!supabase) return { error: "Base de données indisponible." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Identifiants invalides." };

  // Session aal1 obtenue. Le proxy aiguille ensuite : changement de mot de passe
  // provisoire si necessaire, puis enrolement / verification TOTP.
  redirect("/admin");
}

/**
 * Changement du mot de passe provisoire, force a la premiere connexion. Le flag
 * `must_change_password` (metadonnee utilisateur) est baisse ici : tant qu'il est
 * vrai, le proxy renvoie sur cet ecran avant tout acces au back-office.
 */
export async function changeAdminPassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 10) {
    return { error: "Le mot de passe doit faire au moins 10 caractères." };
  }
  if (password === PROVISIONAL_PASSWORD) {
    return { error: "Choisis un mot de passe différent du provisoire." };
  }
  if (password !== confirm) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const supabase = await supabaseServer();
  if (!supabase) return { error: "Base de données indisponible." };

  const { error } = await supabase.auth.updateUser({
    password,
    data: { must_change_password: false },
  });
  if (error) return { error: "Changement impossible. Réessaie dans un instant." };

  // Mot de passe defini : on enchaine sur l'activation du second facteur.
  redirect("/admin/2fa/enroll");
}

/** Deconnexion complete du back-office. */
export async function signOutAdmin(): Promise<void> {
  const supabase = await supabaseServer();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
