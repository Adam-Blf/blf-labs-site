"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase cote navigateur, pour les seuls ecrans d'authentification du
 * back-office (enrolement et verification TOTP). Il porte la cle
 * publiable, soumise a RLS : il ne peut rien lire des donnees metier tant que la
 * session n'est pas aal2. L'enrolement TOTP a besoin du navigateur car il rend
 * un QR code a scanner.
 */
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase non configure : base de données indisponible.");
  }
  client = createBrowserClient(url, key);
  return client;
}
