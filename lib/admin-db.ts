import { supabaseServer } from "@/lib/supabase-server";

/**
 * Le client Supabase lie a la SESSION, jamais la cle de service.
 *
 * Ecrite une fois. Elle etait recopiee dans les deux fichiers d'actions du
 * back-office - quatre lignes anodines, mais c'est exactement ainsi que deux
 * chemins d'ecriture finissent par ne plus poser la meme garantie : RLS
 * applique `is_blf_admin()` (liste blanche + aal2), et cela n'a de sens que si
 * TOUTES les mutations passent par ce client.
 */
export async function db() {
  const supabase = await supabaseServer();
  if (!supabase) throw new Error("Base de données indisponible.");
  return supabase;
}
