import { supabaseServer } from "@/lib/supabase-server";
import { ORDER_COLUMNS, type Lead } from "@/lib/admin-types";
import { KanbanBoard, type KanbanItem } from "@/components/admin/KanbanBoard";
import { PageHeading } from "@/components/admin/PageHeading";
import { updateLeadStatus } from "../../actions";

export const dynamic = "force-dynamic";

/** Pipeline commercial : chaque demande recue via le site, du premier contact
 * au gain ou a la perte. Glisser une carte change son statut en base. */
export default async function LeadsPage() {
  const supabase = await supabaseServer();
  const { data, error } = supabase
    ? await supabase
        .from("orders")
        .select(
          "id, created_at, name, email, phone, project_type, budget_range, deadline, customer_type, company_name, message, status",
        )
        .order("created_at", { ascending: false })
    : { data: null, error: null };

  const leads = (data ?? []) as Lead[];

  const items: KanbanItem<Lead["status"]>[] = leads.map((lead) => ({
    id: lead.id,
    status: lead.status,
    node: (
      <div className="flex flex-col gap-1">
        <span className="title">{lead.name}</span>
        <span className="text-xs text-muted">
          {lead.project_type} - {lead.budget_range}
        </span>
        {lead.company_name && (
          <span className="text-xs text-muted">{lead.company_name}</span>
        )}
        <a
          href={`mailto:${lead.email}`}
          className="text-xs underline decoration-dotted"
        >
          {lead.email}
        </a>
      </div>
    ),
  }));

  return (
    <section className="space-y-8">
      <PageHeading
        title="Leads"
        sub={
          <>
            {leads.length} demande{leads.length > 1 ? "s" : ""}. Glisse une carte
            pour changer son statut.
          </>
        }
      />

      {error && (
        <p className="blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
          Lecture impossible : {error.message}
        </p>
      )}

      <KanbanBoard
        columns={ORDER_COLUMNS}
        items={items}
        onMove={updateLeadStatus}
      />
    </section>
  );
}
