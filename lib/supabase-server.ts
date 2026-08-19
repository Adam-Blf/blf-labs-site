import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase cote serveur, lie a la session de l'utilisateur (cookies).
 *
 * A la difference de `serviceClient()` (cle de service, tout pouvoir) et de
 * `publicClient()` (sans session), celui-ci porte la session du visiteur : les
 * lectures et ecritures passent donc par RLS avec le role `authenticated` et le
 * niveau d'assurance (aal) reels. C'est lui qu'utilisent le back-office (RSC,
 * server actions) et le proxy de garde.
 *
 * Renvoie `null` si la base n'est pas configuree, pour rester coherent avec la
 * regle de degradation gracieuse du reste du site.
 */
export async function supabaseServer(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // En contexte RSC pur, l'ecriture de cookies leve : Supabase rafraichit
        // deja la session dans le proxy, donc on peut ignorer sans risque.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // Appele depuis un Server Component sans reponse mutable : sans effet.
        }
      },
    },
  });
}
