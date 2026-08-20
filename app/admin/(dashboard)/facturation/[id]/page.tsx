import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import {
  INVOICE_COLUMNS,
  SERVICE_ITEM_COLUMNS,
  type Invoice,
  type InvoiceLine,
  type ServiceItem,
} from "@/lib/admin-types";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { InvoiceDocument } from "@/components/admin/InvoiceDocument";

export const dynamic = "force-dynamic";

/** Fiche d'un devis / d'une facture : edition tant que brouillon, puis document
 * conforme verrouille. */
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();
  if (!supabase) notFound();

  const [{ data: invoiceData }, { data: linesData }, { data: catalogData }] =
    await Promise.all([
      supabase.from("invoices").select(INVOICE_COLUMNS).eq("id", id).single(),
      supabase
        .from("invoice_lines")
        .select("id, invoice_id, designation, quantity, unit_price_cents, position")
        .eq("invoice_id", id)
        .order("position", { ascending: true }),
      supabase
        .from("service_items")
        .select(SERVICE_ITEM_COLUMNS)
        .order("times_used", { ascending: false })
        .order("designation", { ascending: true }),
    ]);

  if (!invoiceData) notFound();
  const invoice = invoiceData as Invoice;
  const lines = (linesData ?? []) as InvoiceLine[];
  const catalog = (catalogData ?? []) as ServiceItem[];

  return (
    <section className="space-y-8">
      <div>
        <Link
          href="/admin/facturation"
          className="text-sm text-muted hover:text-ink"
        >
          ← Facturation
        </Link>
        <h1 className="title mt-2 text-2xl">
          {invoice.number ?? "Nouveau document"}
        </h1>
      </div>

      <InvoiceEditor invoice={invoice} lines={lines} catalog={catalog} />

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="title text-lg">Aperçu conforme</h2>
          <a
            href={`/admin/facturation/${id}/pdf`}
            className="blk-sm bg-surface px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-strong"
          >
            Télécharger le PDF
          </a>
        </div>
        <InvoiceDocument invoice={invoice} lines={lines} />
      </div>
    </section>
  );
}
