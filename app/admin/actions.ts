"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/admin-db";
// Treize imports de facturation trainaient ici depuis la scission du fichier
// en actions.ts et actions-facturation.ts : du code mort qui laissait croire
// que ce module touchait encore aux factures.
import { type OrderStatus, type ProjectStatus } from "@/lib/admin-types";

/**
 * Mutations du back-office - activite commerciale.
 *
 * Toutes passent par le client lie a la session : RLS applique la regle
 * is_blf_admin() (whitelist + aal2). Aucune n'utilise la cle de service. Une
 * erreur est renvoyee, jamais avalee en silence.
 *
 * LES ACTIONS DE FACTURATION SONT DANS `actions-facturation.ts`. Le fichier
 * atteignait 462 lignes et melangeait deux metiers : deplacer une carte dans
 * un tableau, et emettre une facture avec sa numerotation, son instantane
 * d'emetteur, son lien de paiement et son courriel. Le second se relit ligne a
 * ligne ; le premier non, et il noyait l'autre.
 */

export async function updateLeadStatus(id: string, status: OrderStatus) {
  const supabase = await db();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
  position?: number,
) {
  const supabase = await db();
  const patch: { status: ProjectStatus; position?: number } = { status };
  if (typeof position === "number") patch.position = position;
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projets");
}

export async function createProject(formData: FormData) {
  const supabase = await db();
  const title = String(formData.get("title") ?? "").trim();
  const client_name = String(formData.get("client_name") ?? "").trim();
  if (!title || !client_name) {
    throw new Error("Titre et client sont obligatoires.");
  }
  const client_email = String(formData.get("client_email") ?? "").trim() || null;
  const amountRaw = String(formData.get("amount_euros") ?? "").trim();
  const amount_cents = amountRaw ? Math.round(parseFloat(amountRaw) * 100) : null;

  const { error } = await supabase.from("projects").insert({
    title,
    client_name,
    client_email,
    amount_cents,
    status: "backlog",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projets");
}

export async function addTask(projectId: string, label: string) {
  const supabase = await db();
  const clean = label.trim();
  if (!clean) return;
  const { error } = await supabase
    .from("project_tasks")
    .insert({ project_id: projectId, label: clean });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projets");
}

export async function toggleTask(id: string, done: boolean) {
  const supabase = await db();
  const { error } = await supabase
    .from("project_tasks")
    .update({ done })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projets");
}
