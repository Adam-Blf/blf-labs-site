import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Acces a la base.
 *
 * Deux clients distincts, volontairement :
 *  - `serviceClient()` porte la cle de service. Elle contourne les regles RLS,
 *    donc elle ne doit JAMAIS etre importee depuis un composant client. Elle ne
 *    sert qu'a la route d'API qui enregistre une commande.
 *  - `publicClient()` porte la cle publiable, soumise a RLS. C'est celle de
 *    l'authentification du back-office.
 *
 * Les deux renvoient `null` quand la configuration est absente : le site doit
 * fonctionner sans base (regle de degradation gracieuse), quitte a ce que la
 * commande parte uniquement par email.
 */

export function serviceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key);
}

/** Emails autorises a ouvrir le back-office, en minuscules. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}
