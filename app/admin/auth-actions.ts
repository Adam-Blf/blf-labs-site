"use server";

import { redirect } from "next/navigation";
import { adminEmails, serviceClient } from "@/lib/supabase/clients";
import { supabaseServer } from "@/lib/supabase/server";

export type LoginState = { error?: string };
export type PasswordState = { error?: string };

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
 * Changement du mot de passe provisoire, force a la premiere connexion.
 *
 * Le flag `must_change_password` vit dans `app_metadata`, que seul le serveur
 * (cle de service) peut ecrire : dans `user_metadata`, n'importe quelle session
 * pouvait le baisser elle-meme. Hors premier passage, l'action exige une session
 * aal2 : un mot de passe vole (aal1) ne suffit plus a verrouiller le compte.
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
  if (password !== confirm) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const supabase = await supabaseServer();
  const service = serviceClient();
  if (!supabase || !service) return { error: "Base de données indisponible." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée. Reconnecte-toi." };

  const premierPassage = user.app_metadata?.must_change_password === true;
  if (!premierPassage) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") {
      return { error: "Valide d'abord ton second facteur." };
    }
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Changement impossible. Réessaie dans un instant." };

  if (premierPassage) {
    const { error: flagError } = await service.auth.admin.updateUserById(user.id, {
      app_metadata: { must_change_password: false },
    });
    if (flagError) return { error: "Changement impossible. Réessaie dans un instant." };
  }

  // Mot de passe defini : on enchaine sur l'activation du second facteur.
  redirect("/admin/2fa/enroll");
}

/** Deconnexion complete du back-office. */
export async function signOutAdmin(): Promise<void> {
  const supabase = await supabaseServer();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
