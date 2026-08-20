import { supabaseServer } from "@/lib/supabase-server";
import {
  INVOICE_COLUMNS,
  SERVICE_ITEM_COLUMNS,
  type Invoice,
  type ServiceItem,
} from "@/lib/admin-types";
import { InvoicesPanel } from "@/components/admin/InvoicesPanel";
import { ServiceItemsPanel } from "@/components/admin/ServiceItemsPanel";

/** Devis et factures BLF Lab's, avec suivi du statut de paiement. */
export async function SectionFacturation() {
  const supabase = await supabaseServer();
  const [{ data }, { data: catalog }] = supabase
    ? await Promise.all([
        supabase
          .from("invoices")
          .select(INVOICE_COLUMNS)
          .order("created_at", { ascending: false }),
        supabase
          .from("service_items")
          .select(SERVICE_ITEM_COLUMNS)
          .order("times_used", { ascending: false })
          .order("designation", { ascending: true }),
      ])
    : [{ data: null }, { data: null }];

  const invoices = (data ?? []) as Invoice[];
  const items = (catalog ?? []) as ServiceItem[];

  return (
    <section className="space-y-10">

      <InvoicesPanel invoices={invoices} />

      <div className="max-w-md">
        <ServiceItemsPanel items={items} />
      </div>
    </section>
  );
}
