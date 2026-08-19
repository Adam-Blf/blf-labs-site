import { supabaseServer } from "@/lib/supabase-server";
import type { Invoice } from "@/lib/admin-types";
import { InvoicesPanel } from "@/components/admin/InvoicesPanel";

export const dynamic = "force-dynamic";

/** Devis et factures BLF Lab's, avec suivi du statut de paiement. */
export default async function FacturationPage() {
  const supabase = await supabaseServer();
  const { data } = supabase
    ? await supabase
        .from("invoices")
        .select(
          "id, created_at, kind, number, status, amount_ttc_cents, issued_at, paid_at, client_name, project_id",
        )
        .order("created_at", { ascending: false })
    : { data: null };

  const invoices = (data ?? []) as Invoice[];

  return (
    <section>
      <div className="mb-6">
        <h1 className="title text-2xl">Facturation</h1>
        <p className="text-sm text-muted">
          {invoices.length} document{invoices.length > 1 ? "s" : ""}.
        </p>
      </div>
      <InvoicesPanel invoices={invoices} />
    </section>
  );
}
