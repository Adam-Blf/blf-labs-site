/**
 * Types et colonnes du back-office. Les libelles des statuts vivent ici, source
 * unique : l'UI (Kanban, filtres) et les futurs rapports lisent ces tableaux.
 */

export type OrderStatus =
  | "nouvelle"
  | "en_cours"
  | "devis_envoye"
  | "gagnee"
  | "perdue";

export type ProjectStatus =
  | "backlog"
  | "en_cours"
  | "revue"
  | "livre"
  | "archive";

export type InvoiceKind = "devis" | "facture";
export type InvoiceStatus = "brouillon" | "envoye" | "paye" | "annule";

export type Column<S extends string> = { id: S; label: string };

export const ORDER_COLUMNS: Column<OrderStatus>[] = [
  { id: "nouvelle", label: "Nouvelle" },
  { id: "en_cours", label: "En cours" },
  { id: "devis_envoye", label: "Devis envoye" },
  { id: "gagnee", label: "Gagnee" },
  { id: "perdue", label: "Perdue" },
];

export const PROJECT_COLUMNS: Column<ProjectStatus>[] = [
  { id: "backlog", label: "Backlog" },
  { id: "en_cours", label: "En cours" },
  { id: "revue", label: "Revue" },
  { id: "livre", label: "Livre" },
  { id: "archive", label: "Archive" },
];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  brouillon: "Brouillon",
  envoye: "Envoye",
  paye: "Paye",
  annule: "Annule",
};

export const INVOICE_KIND_LABELS: Record<InvoiceKind, string> = {
  devis: "Devis",
  facture: "Facture",
};

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: string;
  budget_range: string;
  deadline: string;
  customer_type: string;
  company_name: string | null;
  message: string;
  status: OrderStatus;
};

export type Project = {
  id: string;
  created_at: string;
  title: string;
  client_name: string;
  client_email: string | null;
  status: ProjectStatus;
  amount_cents: number | null;
  due_date: string | null;
  notes: string | null;
  position: number;
};

export type ProjectTask = {
  id: string;
  project_id: string;
  label: string;
  done: boolean;
  position: number;
};

export type Invoice = {
  id: string;
  created_at: string;
  kind: InvoiceKind;
  number: string | null;
  status: InvoiceStatus;
  amount_ttc_cents: number;
  issued_at: string | null;
  paid_at: string | null;
  client_name: string | null;
  project_id: string | null;
};

/** Montant en centimes -> chaine en euros, format francais. */
export function formatEuros(cents: number | null | undefined): string {
  if (cents == null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
