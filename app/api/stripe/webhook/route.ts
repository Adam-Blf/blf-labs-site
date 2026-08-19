import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { serviceClient } from "@/lib/supabase";

// Stripe a besoin du CORPS BRUT et du runtime Node pour verifier la signature.
export const runtime = "nodejs";

/**
 * Webhook Stripe. Point sensible (checklist 32/33) :
 *  - la signature est VERIFIEE sur le corps brut ; sans elle, on refuse (400) et
 *    rien n'est modifie ;
 *  - l'ecriture passe par la cle de service (aucune session cote webhook), donc
 *    contourne RLS, cote serveur uniquement ;
 *  - aucune trace technique ne sort vers l'appelant.
 * L'URL enregistree chez Stripe DOIT pointer sur le domaine actif (beloucif.com).
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) {
    return new NextResponse("Non configure", { status: 400 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    // Signature invalide : on ne touche a rien.
    return new NextResponse("Signature invalide", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const invoiceId =
        (session.metadata?.invoice_id as string | undefined) ?? null;
      const paymentLinkId =
        typeof session.payment_link === "string" ? session.payment_link : null;
      const stripeRef =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;

      const supabase = serviceClient();
      if (supabase) {
        const patch = {
          status: "paye" as const,
          payment_method: "Carte",
          paid_at: new Date().toISOString().slice(0, 10),
          stripe_ref: stripeRef,
        };
        // On cible par l'id de facture (metadata) si present, sinon par l'id du
        // lien de paiement stocke sur la facture. On ne repasse jamais une piece
        // deja payee.
        const query = supabase.from("invoices").update(patch).neq("status", "paye");
        const { error } = invoiceId
          ? await query.eq("id", invoiceId)
          : paymentLinkId
            ? await query.eq("stripe_payment_link_id", paymentLinkId)
            : { error: null };
        if (error) {
          // Logue serveur only, rien vers Stripe : Stripe renverra le webhook.
          console.error("[stripe webhook] maj facture:", error.message);
          return new NextResponse("Erreur interne", { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
