import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jetons signes pour la confirmation d'inscription et la desinscription.
 *
 * POURQUOI UNE SIGNATURE ET PAS UN IDENTIFIANT EN BASE.
 *
 * Un lien de desinscription doit fonctionner des annees apres l'envoi, sans
 * authentification, et sans que la personne ait quoi que ce soit a retrouver.
 * Un jeton signe porte lui-meme son adresse : il reste valable meme si la fiche
 * a ete purgee, et il ne cree aucune ligne a nettoyer. Un identifiant stocke,
 * lui, meurt avec la ligne, et c'est exactement le moment ou quelqu'un clique.
 *
 * POURQUOI PAS D'EXPIRATION SUR LA DESINSCRIPTION.
 *
 * Un lien de retrait qui expire est un lien de retrait qui ne marche pas. La
 * loi exige un moyen d'opposition simple et gratuit a tout moment, pas pendant
 * trente jours. Seule la confirmation d'inscription expire, parce qu'un
 * consentement vieux de six mois qu'on n'a jamais confirme n'est plus un
 * consentement.
 *
 * Le secret est distinct de tout autre secret du site : il ne signe rien qui
 * donne un acces, uniquement des liens publics de retrait.
 */

export type UsageJeton = "desinscription" | "confirmation";

/** Duree de vie d'un lien de confirmation, en millisecondes. Sept jours. */
const DUREE_CONFIRMATION = 7 * 24 * 60 * 60 * 1000;

type Charge = {
  u: UsageJeton;
  e: string;
  /** Echeance en millisecondes depuis l'epoque. Absente = sans expiration. */
  x?: number;
};

function secret(): string {
  const valeur = process.env.UNSUBSCRIBE_SECRET;
  if (!valeur) {
    // En production, un jeton non signe vaut un lien de desinscription
    // falsifiable : n'importe qui pourrait desinscrire n'importe quelle
    // adresse. Mieux vaut refuser de demarrer que d'envoyer des liens faibles.
    throw new Error("UNSUBSCRIBE_SECRET manquant.");
  }
  return valeur;
}

function b64url(valeur: Buffer | string): string {
  return Buffer.from(valeur)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signe(charge: string): string {
  return b64url(createHmac("sha256", secret()).update(charge).digest());
}

export function creeJeton(usage: UsageJeton, email: string, maintenant = Date.now()): string {
  const charge: Charge = { u: usage, e: email.toLowerCase() };
  if (usage === "confirmation") charge.x = maintenant + DUREE_CONFIRMATION;
  const encode = b64url(JSON.stringify(charge));
  return `${encode}.${signe(encode)}`;
}

/**
 * Rend l'adresse portee par le jeton, ou `null` si la signature est fausse,
 * l'usage different de celui attendu, ou le jeton expire.
 *
 * Aucun detail sur la cause du rejet ne remonte : distinguer une signature
 * invalide d'un jeton expire donnerait a un attaquant de quoi tatonner.
 */
export function litJeton(
  usage: UsageJeton,
  jeton: string | null | undefined,
  maintenant = Date.now(),
): string | null {
  if (!jeton) return null;
  const separateur = jeton.lastIndexOf(".");
  if (separateur <= 0) return null;

  const encode = jeton.slice(0, separateur);
  const signature = jeton.slice(separateur + 1);
  const attendue = signe(encode);

  // Comparaison a temps constant : une comparaison naive fuit, octet par octet,
  // de quoi reconstruire une signature valide.
  const a = Buffer.from(signature);
  const b = Buffer.from(attendue);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let charge: Charge;
  try {
    charge = JSON.parse(Buffer.from(encode, "base64url").toString("utf8")) as Charge;
  } catch {
    return null;
  }

  if (charge.u !== usage) return null;
  if (typeof charge.e !== "string" || charge.e.length === 0) return null;
  if (typeof charge.x === "number" && charge.x < maintenant) return null;
  return charge.e;
}

/** Adresse publique du lien de desinscription pour une adresse donnee. */
export function lienDesinscription(email: string, base: string): string {
  return `${base}/desinscription?jeton=${creeJeton("desinscription", email)}`;
}

/** Adresse publique du lien de confirmation d'inscription. */
export function lienConfirmation(email: string, base: string): string {
  return `${base}/api/inscription/confirmer?jeton=${creeJeton("confirmation", email)}`;
}
