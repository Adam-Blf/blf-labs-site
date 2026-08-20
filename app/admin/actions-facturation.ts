"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/admin-db";
import {
  defaultPaymentTerms,
  dueDateFrom,
  issuerSnapshot,
} from "@/lib/invoice";
import { isSirenOrSiret } from "@/lib/siren";
import { createInvoicePaymentLink } from "@/lib/stripe";
import { sendInvoicePaymentEmail } from "@/lib/mail";
import {
  formatEuros,
  INVOICE_COLUMNS,
  type Invoice,
  type InvoiceKind,
  type InvoiceStatus,
  type OrderStatus,
  type ProjectStatus,
} from "@/lib/admin-types";


/**
 * Mutations du back-office - devis, factures et paiements.
 *
 * Sorties de `actions.ts`, qui atteignait 462 lignes. Ce qui vit ici engage
 * comptablement : numerotation continue, instantane de l'emetteur, lien de
 * paiement Stripe, envoi du courriel. Cela se relit ligne a ligne, et se
 * relisait mal au milieu des deplacements de cartes.
 */

/** Recalcule le total d'une facture depuis ses lignes. Franchise TVA : HT = TTC. */
async function recomputeInvoiceTotals(
  supabase: Awaited<ReturnType<typeof db>>,
  invoiceId: string,
) {
  const { data: lines, error } = await supabase
    .from("invoice_lines")
    .select("quantity, unit_price_cents")
    .eq("invoice_id", invoiceId);
  if (error) throw new Error(error.message);
  const total = (lines ?? []).reduce(
    (sum, l) => sum + Math.round(Number(l.quantity) * l.unit_price_cents),
    0,
  );
  const { error: upErr } = await supabase
    .from("invoices")
    .update({ amount_ht_cents: total, vat_cents: 0, amount_ttc_cents: total })
    .eq("id", invoiceId);
  if (upErr) throw new Error(upErr.message);
}

/** Cree un brouillon de devis/facture et ouvre son editeur. */
export async function createInvoice(formData: FormData) {
  const supabase = await db();
  const kind = String(formData.get("kind") ?? "devis") as InvoiceKind;
  const client_type = String(formData.get("client_type") ?? "entreprise");
  const client_name = String(formData.get("client_name") ?? "").trim() || null;
  const client_email = String(formData.get("client_email") ?? "").trim() || null;

  const { data, error } = await supabase
    .from("invoices")
    .insert({ kind, client_type, client_name, client_email, status: "brouillon" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Montant rapide : si un montant global est saisi a la creation, on pose une
  // ligne unique "Prestation". L'utilisateur peut ensuite detailler s'il veut.
  const amountRaw = String(formData.get("amount_euros") ?? "").trim();
  const amountCents = amountRaw ? Math.round(parseFloat(amountRaw) * 100) : 0;
  if (amountCents > 0) {
    const { error: lineErr } = await supabase.from("invoice_lines").insert({
      invoice_id: data.id,
      designation: "Prestation",
      quantity: 1,
      unit_price_cents: amountCents,
      position: 0,
    });
    if (lineErr) throw new Error(lineErr.message);
    await recomputeInvoiceTotals(supabase, data.id);
  }

  revalidatePath("/admin/facturation");
  redirect(`/admin/facturation/${data.id}`);
}

/** Met a jour les coordonnees de l'acheteur sur un brouillon. */
export async function updateInvoiceClient(id: string, formData: FormData) {
  const supabase = await db();
  const patch = {
    client_type: String(formData.get("client_type") ?? "entreprise"),
    client_name: String(formData.get("client_name") ?? "").trim() || null,
    client_email: String(formData.get("client_email") ?? "").trim() || null,
    client_siren: String(formData.get("client_siren") ?? "").trim() || null,
    client_address_street:
      String(formData.get("client_address_street") ?? "").trim() || null,
    client_postal_code:
      String(formData.get("client_postal_code") ?? "").trim() || null,
    client_city: String(formData.get("client_city") ?? "").trim() || null,
    client_country: String(formData.get("client_country") ?? "").trim() || null,
    // Date de realisation de la prestation (art. 242 nonies A, 3° CGI), affichee
    // seulement si elle differe de la date d'emission.
    service_date: String(formData.get("service_date") ?? "").trim() || null,
  };
  // Le verrou d'une piece emise ne peut pas vivre uniquement dans l'affichage :
  // on refuse la mutation cote serveur si la piece n'est plus un brouillon.
  const { data, error } = await supabase
    .from("invoices")
    .update(patch)
    .eq("id", id)
    .eq("status", "brouillon")
    .select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error("Pièce déjà émise : son contenu est figé.");
  }
  revalidatePath(`/admin/facturation/${id}`);
}

/**
 * Verrou d'intangibilite : une piece emise (numerotee) ne se modifie plus. Les
 * lignes n'ont pas de statut, on controle donc celui de la facture parente avant
 * toute mutation de ligne.
 */
async function assertDraft(
  supabase: Awaited<ReturnType<typeof db>>,
  invoiceId: string,
) {
  const { data, error } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .single();
  if (error) throw new Error(error.message);
  if (data.status !== "brouillon") {
    throw new Error("Pièce déjà émise : ses lignes sont figées.");
  }
}

/** Ajoute une ligne a un brouillon et recalcule le total. */
export async function addInvoiceLine(invoiceId: string, formData: FormData) {
  const supabase = await db();
  await assertDraft(supabase, invoiceId);
  const designation = String(formData.get("designation") ?? "").trim();
  if (!designation) throw new Error("La désignation est obligatoire.");
  const quantity = parseFloat(String(formData.get("quantity") ?? "1")) || 1;
  const unitRaw = String(formData.get("unit_price_euros") ?? "").trim();
  const unit_price_cents = unitRaw ? Math.round(parseFloat(unitRaw) * 100) : 0;

  const { count } = await supabase
    .from("invoice_lines")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", invoiceId);

  const { error } = await supabase.from("invoice_lines").insert({
    invoice_id: invoiceId,
    designation,
    quantity,
    unit_price_cents,
    position: count ?? 0,
  });
  if (error) throw new Error(error.message);
  await recomputeInvoiceTotals(supabase, invoiceId);

  // Auto-save au catalogue : une prestation facturee devient reutilisable pour
  // aller plus vite la prochaine fois. Best-effort, on ignore une erreur
  // eventuelle pour ne jamais bloquer l'ajout de la ligne lui-meme.
  await supabase.rpc("remember_service_item", {
    p_designation: designation,
    p_cents: unit_price_cents,
  });

  revalidatePath("/admin/facturation");
  revalidatePath(`/admin/facturation/${invoiceId}`);
}

/** Supprime une ligne d'un brouillon et recalcule le total. */
export async function removeInvoiceLine(lineId: string, invoiceId: string) {
  const supabase = await db();
  await assertDraft(supabase, invoiceId);
  const { error } = await supabase
    .from("invoice_lines")
    .delete()
    .eq("id", lineId);
  if (error) throw new Error(error.message);
  await recomputeInvoiceTotals(supabase, invoiceId);
  revalidatePath(`/admin/facturation/${invoiceId}`);
}

/**
 * Emet le document : attribue un numero legal (sequentiel, sans trou, via la
 * fonction en base), fige l'identite de l'emetteur, pose la date et l'echeance,
 * et verrouille la piece (statut envoye). N'agit que sur un brouillon.
 */
export async function issueInvoice(id: string) {
  const supabase = await db();
  const { data: inv, error: readErr } = await supabase
    .from("invoices")
    .select("id, kind, status, payment_terms, client_type, client_name, client_siren")
    .eq("id", id)
    .single();
  if (readErr) throw new Error(readErr.message);
  if (inv.status !== "brouillon") {
    throw new Error("Cette pièce est déjà émise.");
  }

  // Garde avant d'attribuer un numero legal : celui-ci est sequentiel et
  // irreversible, on ne le consomme donc pas pour une piece incomplete. Une
  // facture doit porter l'identite de l'acheteur ; pour un professionnel, le
  // SIREN / SIRET est obligatoire (art. 242 nonies A CGI, art. L441-9 c. com.).
  if (!inv.client_name?.trim()) {
    throw new Error("Renseignez le client avant d'émettre la pièce.");
  }
  if (inv.client_type === "entreprise") {
    if (!inv.client_siren?.trim()) {
      throw new Error(
        "Le SIREN ou le SIRET du client professionnel est obligatoire pour émettre.",
      );
    }
    if (!isSirenOrSiret(inv.client_siren)) {
      throw new Error(
        "Le SIREN / SIRET du client est invalide (9 ou 14 chiffres, clé de contrôle).",
      );
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const year = Number(today.slice(0, 4));
  const { data: number, error: numErr } = await supabase.rpc(
    "next_invoice_number",
    { p_kind: inv.kind, p_year: year },
  );
  if (numErr) throw new Error(numErr.message);

  const { error } = await supabase
    .from("invoices")
    .update({
      number,
      status: "envoye",
      issued_at: today,
      due_date: dueDateFrom(today),
      payment_terms: inv.payment_terms ?? defaultPaymentTerms(inv.client_type),
      issuer_snapshot: issuerSnapshot(),
    })
    .eq("id", id)
    .eq("status", "brouillon");
  if (error) throw new Error(error.message);

  // Pour une facture (pas un devis), on genere le lien de paiement et on l'envoie
  // au client. En best-effort : si Stripe ou l'email echoue, l'emission reste
  // valide (numero attribue), le lien pourra etre regenere depuis la fiche.
  if (inv.kind === "facture") {
    try {
      await generatePaymentLink(id);
    } catch {
      // Silencieux : la facture est emise, le lien se regenere a la main.
    }
  }

  revalidatePath(`/admin/facturation/${id}`);
}

/** Enregistre le mode de reglement d'une facture (pour le livre des recettes). */
export async function setInvoicePaymentMethod(id: string, method: string) {
  const supabase = await db();
  const { error } = await supabase
    .from("invoices")
    .update({ payment_method: method || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/facturation/${id}`);
  revalidatePath("/admin/comptabilite");
}

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

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const supabase = await db();
  const patch: { status: InvoiceStatus; paid_at?: string | null } = { status };
  if (status === "paye") patch.paid_at = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("invoices").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/facturation");
}

/**
 * Supprime un brouillon ; ses lignes suivent par cascade (FK on delete cascade).
 * Une piece emise ne se supprime JAMAIS : elle porte un numero legal dont la
 * sequence doit rester continue, sans trou. Pour la solder, on passe son statut
 * a "annule", on ne l'efface pas. Le garde `.eq("status", "brouillon")` refuse
 * donc la suppression de toute piece deja numerotee.
 */
export async function deleteInvoice(id: string) {
  const supabase = await db();
  const { data, error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("status", "brouillon")
    .select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error(
      "Seul un brouillon peut être supprimé ; une pièce émise doit être annulée.",
    );
  }
  revalidatePath("/admin/facturation");
}

/**
 * Catalogue de prestations reutilisables. Ajout manuel : on passe par la meme
 * fonction que l'auto-save (insert ou actualisation sans doublon), pour qu'une
 * saisie manuelle et une prestation deja apprise ne se dedoublent pas.
 */
export async function createServiceItem(formData: FormData) {
  const supabase = await db();
  const designation = String(formData.get("designation") ?? "").trim();
  if (!designation) throw new Error("La désignation est obligatoire.");
  const priceRaw = String(formData.get("unit_price_euros") ?? "").trim();
  const cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : 0;
  const { error } = await supabase.rpc("remember_service_item", {
    p_designation: designation,
    p_cents: cents,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/facturation");
}

/** Met a jour la designation et le prix d'une prestation du catalogue. */
export async function updateServiceItem(id: string, formData: FormData) {
  const supabase = await db();
  const designation = String(formData.get("designation") ?? "").trim();
  if (!designation) throw new Error("La désignation est obligatoire.");
  const priceRaw = String(formData.get("unit_price_euros") ?? "").trim();
  const cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : 0;
  const { error } = await supabase
    .from("service_items")
    .update({ designation, unit_price_cents: cents, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/facturation");
}

/** Retire une prestation du catalogue (n'affecte aucune facture deja emise). */
export async function deleteServiceItem(id: string) {
  const supabase = await db();
  const { error } = await supabase.from("service_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/facturation");
}
