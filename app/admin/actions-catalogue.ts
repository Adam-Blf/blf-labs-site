"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/admin/db";

/**
 * CATALOGUE DE PRESTATIONS.
 *
 * Sorti de `actions-facturation.ts` le 25/08/2026 : ce fichier passait le seuil
 * de 400 lignes que `verifie:admin` fait respecter, et le catalogue en etait la
 * part la plus autonome. Il ne touche ni au numero legal, ni au statut, ni au
 * paiement : c'est une bibliotheque de libelles et de prix, pas de la
 * comptabilite. Une responsabilite par fichier.
 */

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
  revalidatePath("/admin/argent");
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
  revalidatePath("/admin/argent");
}

/** Retire une prestation du catalogue (n'affecte aucune facture deja emise). */
export async function deleteServiceItem(id: string) {
  const supabase = await db();
  const { error } = await supabase.from("service_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/argent");
}
