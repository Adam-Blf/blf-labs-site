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

/** Statut de journal correspondant a un type d'evenement Resend. */
const STATUTS: Record<string, string> = {
  "email.delivered": "delivre",
  "email.opened": "ouvert",
  "email.clicked": "clic",
  "email.bounced": "bounce",
  "email.complained": "plainte",
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
    await db
      .from("email_sends")
      .update({ statut })
      .eq("resend_id", evenement.data.email_id);
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
