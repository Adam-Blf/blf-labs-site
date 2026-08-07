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
  const salt = process.env.IP_HASH_SALT;

  // Le sel n'a pas de valeur de repli en production, et c'est deliberé.
  //
  // Une valeur de secours ecrite dans le code est publique : le depot est
  // ouvert. Un tiers qui la lit peut alors recalculer l'empreinte de
  // n'importe quelle adresse IP et retrouver, par simple comparaison, qui a
  // envoye une demande. L'empreinte cesse d'etre une mesure de minimisation
  // et redevient une donnee personnelle identifiante, ce que la politique de
  // confidentialite affirme pourtant le contraire.
  //
  // Mieux vaut refuser de demarrer qu'annoncer une protection qui n'existe
  // pas. En developpement, un sel fixe est tolere : aucune donnee reelle n'y
  // transite, et exiger la variable rendrait le projet impossible a lancer
  // apres un simple clonage.
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "IP_HASH_SALT est absente. Sans sel secret, l'empreinte d'IP est " +
          "reversible et ne protege plus rien.",
      );
    }
    return createHash("sha256").update(`developpement:${ip}`).digest("hex");
  }

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
