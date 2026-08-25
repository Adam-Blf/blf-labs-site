import { NextResponse } from "next/server";
import { Resend } from "resend";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CE QUE DEVIENNENT LES MESSAGES ENVOYES.
 *
 * Sans cette route, le back-office afficherait "envoye" pour l'eternite, y
 * compris pour une adresse qui n'existe pas et pour quelqu'un qui a cliqué sur
 * "indesirable". Or ce sont exactement les deux evenements qui comptent :
 *
 *   - une plainte, c'est une opposition. La personne sort de la liste sur le
 *     champ, sans attendre qu'elle trouve le lien de desinscription ;
 *   - une adresse morte qu'on continue de solliciter est le signal numero un
 *     qui fait basculer un domaine en indesirable, et il emporte avec lui les
 *     factures et les accuses de reception partant du meme domaine.
 *
 * Les deux alimentent donc la liste de suppression automatiquement.
 *
 * VERIFICATION DE SIGNATURE OBLIGATOIRE. Cette adresse est publique et ecrit en
 * base. Sans signature, n'importe qui pourrait declarer une plainte au nom de
 * n'importe quelle adresse, et vider la liste. Le corps est lu en texte brut :
 * analyser puis reserialiser le JSON casse la signature, qui porte sur les
 * octets exacts.
 */

type EvenementResend = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    bounce?: { type?: string; subType?: string };
  };
};

/**
 * Statut de journal correspondant a un type d'evenement Resend, avec son RANG.
 *
 * Resend ne garantit aucun ordre de livraison des evenements. Un
 * `email.delivered` qui arrive apres un `email.clicked` faisait regresser le
 * journal de « Cliqué » a « Délivré », et l'ecran des envois sous-estimait
 * l'engagement sans que rien ne le signale.
 *
 * Le rang ne descend jamais, sauf pour un rebond ou une plainte : ceux-la sont
 * des verdicts, pas des etapes, et doivent s'imposer quel que soit l'ordre.
 */
const STATUTS: Record<string, { nom: string; rang: number }> = {
  "email.delivered": { nom: "delivre", rang: 2 },
  "email.opened": { nom: "ouvert", rang: 3 },
  "email.clicked": { nom: "clic", rang: 4 },
  "email.bounced": { nom: "bounce", rang: 9 },
  "email.complained": { nom: "plainte", rang: 9 },
};

/** Rang courant d'un statut deja enregistre. */
const RANGS: Record<string, number> = {
  file: 0,
  envoye: 1,
  delivre: 2,
  ouvert: 3,
  clic: 4,
  echec: 9,
  bounce: 9,
  plainte: 9,
};

/**
 * Un rebond est traite comme definitif sauf si Resend dit explicitement le
 * contraire. Le sens de l'erreur compte : prendre un rebond definitif pour un
 * rebond passager fait continuer les envois vers une adresse morte, ce qui
 * coute la reputation du domaine. L'inverse ne coute qu'un contact retire a
 * tort, qui peut se reinscrire.
 */
function rebondDefinitif(evenement: EvenementResend): boolean {
  const type = evenement.data?.bounce?.type?.toLowerCase() ?? "";
  return !type.includes("transient") && !type.includes("soft");
}

function premiereAdresse(evenement: EvenementResend): string | null {
  const cible = evenement.data?.to;
  if (Array.isArray(cible)) return cible[0] ?? null;
  return typeof cible === "string" ? cible : null;
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return new NextResponse(null, { status: 503 });

  const brut = await request.text();
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");

  if (!id || !timestamp || !signature) return new NextResponse(null, { status: 400 });

  let evenement: EvenementResend;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY ?? "verification-seulement");
    evenement = resend.webhooks.verify({
      payload: brut,
      headers: { id, timestamp, signature },
      webhookSecret: secret,
    }) as EvenementResend;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const db = serviceClient();
  if (!db) return new NextResponse(null, { status: 503 });

  const email = premiereAdresse(evenement);
  const type = evenement.type ?? "inconnu";

  await db.from("email_events").insert({
    resend_id: evenement.data?.email_id ?? null,
    email: email ?? "inconnu@invalide",
    type,
    charge: evenement as unknown as Record<string, unknown>,
  });

  const statut = STATUTS[type];
  if (statut && evenement.data?.email_id) {
    const { data: ligne } = await db
      .from("email_sends")
      .select("id, statut")
      .eq("resend_id", evenement.data.email_id)
      .maybeSingle();

    const rangActuel = RANGS[ligne?.statut as string] ?? -1;
    if (ligne && statut.rang >= rangActuel) {
      await db.from("email_sends").update({ statut: statut.nom }).eq("id", ligne.id);
    }
  }

  if (email) {
    if (type === "email.opened" || type === "email.clicked") {
      // Fonde la duree de conservation : trois ans sans interaction et le
      // consentement est repute caduc.
      await db
        .from("contacts")
        .update({ last_engagement_at: new Date().toISOString() })
        .eq("email", email);
    }

    if (type === "email.complained") {
      await db.rpc("desinscrire", { cible: email, motif: "plainte" });
    }

    if (type === "email.bounced" && rebondDefinitif(evenement)) {
      await db.rpc("desinscrire", { cible: email, motif: "bounce_dur" });
    }
  }

  return new NextResponse(null, { status: 200 });
}
