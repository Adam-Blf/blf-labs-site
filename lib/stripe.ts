import Stripe from "stripe";
import type { Invoice } from "@/lib/admin-types";

/**
 * Acces a Stripe, isole ici. On ne depend de Stripe qu'a cet endroit et dans le
 * webhook. Renvoie null si la cle n'est pas configuree, pour que le reste du
 * site fonctionne sans (degradation gracieuse) : sans Stripe, pas de lien de
 * paiement, mais la facture reste emise et telechargeable.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/**
 * Cree un lien de paiement durable pour une facture. Micro-entreprise en
 * franchise de TVA : le montant Stripe est le TTC (= HT). On rattache l'id de la
 * facture au paiement pour que le webhook sache quelle piece marquer payee.
 */
export async function createInvoicePaymentLink(
  invoice: Invoice,
  origin: string,
): Promise<{ url: string; id: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe non configuré.");
  if (invoice.amount_ttc_cents <= 0) {
    throw new Error("Le montant de la facture doit être supérieur à zéro.");
  }

  const price = await stripe.prices.create({
    currency: "eur",
    unit_amount: invoice.amount_ttc_cents,
    product_data: { name: `Facture ${invoice.number ?? invoice.id}` },
  });

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { invoice_id: invoice.id },
    payment_intent_data: { metadata: { invoice_id: invoice.id } },
    after_completion: {
      type: "redirect",
      redirect: { url: `${origin}/commander/merci` },
    },
  });

  return { url: link.url, id: link.id };
}
