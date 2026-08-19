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

/** Identite legale de l'emetteur, figee sur la facture au moment de l'emission. */
export type IssuerSnapshot = {
  legalName: string;
  legalMention: string;
  legalForm: string;
  siren: string;
  siret: string;
  ape: string;
  apeLabel: string;
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressCountry: string;
  email: string;
  phone: string;
  vat: string;
};

export type Invoice = {
  id: string;
  created_at: string;
  kind: InvoiceKind;
  number: string | null;
  status: InvoiceStatus;
  amount_ht_cents: number;
  amount_ttc_cents: number;
  issued_at: string | null;
  due_date: string | null;
  paid_at: string | null;
  payment_terms: string | null;
  client_type: string;
  client_name: string | null;
  client_email: string | null;
  client_siren: string | null;
  client_address_street: string | null;
  client_postal_code: string | null;
  client_city: string | null;
  client_country: string | null;
  issuer_snapshot: IssuerSnapshot | null;
  project_id: string | null;
};

export type InvoiceLine = {
  id: string;
  invoice_id: string;
  designation: string;
  quantity: number;
  unit_price_cents: number;
  position: number;
};

/** Colonnes lues pour une facture complete (liste + fiche). */
export const INVOICE_COLUMNS =
  "id, created_at, kind, number, status, amount_ht_cents, amount_ttc_cents, issued_at, due_date, paid_at, payment_terms, client_type, client_name, client_email, client_siren, client_address_street, client_postal_code, client_city, client_country, issuer_snapshot, project_id";

/** Montant en centimes -> chaine en euros, format francais. */
export function formatEuros(cents: number | null | undefined): string {
  if (cents == null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
