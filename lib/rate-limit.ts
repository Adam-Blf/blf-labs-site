import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Limitation de debit du formulaire de commande.
 *
 * Comptage en base plutot qu'en memoire : sur une plateforme sans etat comme
 * Vercel, chaque invocation peut demarrer un processus neuf, donc un compteur
 * en memoire ne retient rien et ne limite rien.
 *
 * RGPD : l'adresse IP n'est jamais stockee en clair. On garde une empreinte
 * SHA-256 salee, suffisante pour compter les envois d'un meme visiteur sur une
 * heure, mais qui ne permet pas de remonter a l'adresse sans le sel.
 */

const MAX_PER_WINDOW = 3;
const WINDOW_MINUTES = 60;

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "blf-labs-sel-par-defaut";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Extrait l'adresse d'appel derriere le proxy de l'hebergeur.
 * `x-forwarded-for` peut contenir une chaine de relais : le client reel est le
 * premier element.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "inconnue";
}

/**
 * Vrai si l'empreinte a deja atteint le quota sur la fenetre courante.
 * En cas d'erreur de lecture, on laisse passer : mieux vaut accepter une
 * commande de trop que d'en perdre une a cause d'un incident de base.
 */
export async function isRateLimited(
  client: SupabaseClient,
  ipHash: string,
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

  const { count, error } = await client
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (error) return false;
  return (count ?? 0) >= MAX_PER_WINDOW;
}
