"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/admin-db";
import { createInvoicePaymentLink } from "@/lib/stripe";
import { sendInvoicePaymentEmail } from "@/lib/mail";
import { formatEuros, INVOICE_COLUMNS, type Invoice } from "@/lib/admin-types";

/**
 * LIEN DE PAIEMENT ET RELANCE PAR EMAIL.
 *
 * Sorti de `actions-facturation.ts` le 25/08/2026, pour la meme raison que le
 * catalogue : le fichier depassait le seuil d'architecture. La frontiere est
 * nette et elle n'est pas arbitraire. Ce fichier est le SEUL du pole facturation
 * a dependre de Stripe et de l'envoi d'email, donc le seul dont l'import exige
 * des cles tierces. Le garder a part evite d'entrainer ces dependances partout
 * ou l'on ne veut qu'ecrire une ligne en base.
 */

/**
 * Cree (ou reutilise) le lien de paiement Stripe d'une facture et le stocke.
 * Idempotent : si un lien existe deja, on le renvoie. Renvoie la facture a jour.
 */
async function ensurePaymentLink(
  supabase: Awaited<ReturnType<typeof db>>,
  id: string,
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  const invoice = data as Invoice;
  if (invoice.payment_url) return invoice;

  const origin = (await headers()).get("origin") ?? "";
  const { url, id: linkId } = await createInvoicePaymentLink(invoice, origin);
  const { error: upErr } = await supabase
    .from("invoices")
    .update({ payment_url: url, stripe_payment_link_id: linkId })
    .eq("id", id);
  if (upErr) throw new Error(upErr.message);
  return { ...invoice, payment_url: url, stripe_payment_link_id: linkId };
}

/** Genere le lien de paiement d'une facture et l'envoie au client par email. */
export async function generatePaymentLink(id: string) {
  const supabase = await db();
  const invoice = await ensurePaymentLink(supabase, id);
  if (invoice?.client_email && invoice.payment_url) {
    await sendInvoicePaymentEmail({
      to: invoice.client_email,
      number: invoice.number ?? id,
      amountLabel: formatEuros(invoice.amount_ttc_cents),
      paymentUrl: invoice.payment_url,
    });
  }
  revalidatePath(`/admin/facturation/${id}`);
}

/**
 * Corrige la date d'encaissement d'une piece deja pointee payee.
 *
 * POURQUOI CETTE ACTION EXISTE. `updateInvoiceStatus` pose `paid_at` a la date
 * du CLIC, faute de mieux. Or le recapitulatif URSSAF et le livre des recettes
 * se calculent exclusivement sur cette colonne : un reglement recu le 30 juin et
 * pointe le 2 juillet bascule de trimestre, et la declaration part fausse. Le
 * pointage est un geste d'exploitation, il ne coincide pas avec l'encaissement.
 *
 * La date future est refusee : on ne declare pas une recette qui n'existe pas
 * encore. Une date ANTERIEURE a l'emission reste acceptee, elle est legitime
 * quand la piece est etablie apres coup pour un travail deja regle.
 */
