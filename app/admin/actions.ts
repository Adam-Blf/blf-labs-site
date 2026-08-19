"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import type {
  InvoiceKind,
  InvoiceStatus,
  OrderStatus,
  ProjectStatus,
} from "@/lib/admin-types";

/**
 * Mutations du back-office. Toutes passent par le client lie a la session :
 * RLS applique la regle is_blf_admin() (whitelist + aal2). Aucune n'utilise la
 * cle de service. Une erreur est renvoyee, jamais avalee en silence.
 */

async function db() {
  const supabase = await supabaseServer();
  if (!supabase) throw new Error("Base de données indisponible.");
  return supabase;
}

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

export async function createInvoice(formData: FormData) {
  const supabase = await db();
  const kind = String(formData.get("kind") ?? "devis") as InvoiceKind;
  const number = String(formData.get("number") ?? "").trim() || null;
  const client_name = String(formData.get("client_name") ?? "").trim() || null;
  const ttcRaw = String(formData.get("amount_ttc_euros") ?? "").trim();
  const amount_ttc_cents = ttcRaw ? Math.round(parseFloat(ttcRaw) * 100) : 0;

  const { error } = await supabase.from("invoices").insert({
    kind,
    number,
    client_name,
    amount_ht_cents: amount_ttc_cents,
    amount_ttc_cents,
    status: "brouillon",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/facturation");
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const supabase = await db();
  const patch: { status: InvoiceStatus; paid_at?: string | null } = { status };
  if (status === "paye") patch.paid_at = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("invoices").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/facturation");
}
