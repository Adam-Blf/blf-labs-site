import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import {
  INVOICE_COLUMNS,
  INVOICE_KIND_LABELS,
  INVOICE_STATUS_LABELS,
  formatEuros,
  type Invoice,
  type Lead,
} from "@/lib/admin-types";
import { tresorerie } from "@/lib/urssaf";
import { PageHeading } from "@/components/admin/PageHeading";
import { Vide } from "@/components/admin/Vide";

export const dynamic = "force-dynamic";

/**
 * Accueil du back-office : une vue d'ensemble avant d'entrer dans le detail. Les
 * indicateurs sont derives des memes tables que les pages dediees, on ne stocke
 * aucun agregat separe qui pourrait diverger.
 */
export default async function OverviewPage() {
  const supabase = await supabaseServer();

  const [leadsRes, projectsRes, invoicesRes] = supabase
    ? await Promise.all([
        supabase
          .from("orders")
          .select("id, name, project_type, status, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("projects").select("id, status"),
        supabase
          .from("invoices")
          .select(INVOICE_COLUMNS)
          .order("created_at", { ascending: false }),
      ])
    : [{ data: null }, { data: null }, { data: null }];

  const leads = (leadsRes.data ?? []) as Lead[];
  const projects = (projectsRes.data ?? []) as { status: string }[];
  const invoices = (invoicesRes.data ?? []) as Invoice[];

  const { encaisseCents, aEncaisserCents } = tresorerie(invoices);

  const leadsEnCours = leads.filter(
    (l) => l.status !== "gagnee" && l.status !== "perdue",
  ).length;
  const projetsActifs = projects.filter(
    (p) => p.status === "backlog" || p.status === "en_cours" || p.status === "revue",
  ).length;

  // CA encaisse du mois en cours : factures payees dont le reglement tombe ce
  // mois-ci. Meme source que la comptabilite (statut paye), filtre sur le mois.
  const ym = new Date().toISOString().slice(0, 7);
  const caMoisCents = invoices
    .filter((i) => i.status === "paye" && (i.paid_at ?? "").slice(0, 7) === ym)
    .reduce((s, i) => s + i.amount_ttc_cents, 0);

  const impayes = invoices.filter(
    (i) => i.kind === "facture" && i.status === "envoye",
  );
  const impayesCents = impayes.reduce((s, i) => s + i.amount_ttc_cents, 0);

  const tiles = [
    { label: "CA encaissé (mois)", value: formatEuros(caMoisCents), accent: true },
    { label: "Encaissé (total)", value: formatEuros(encaisseCents) },
    {
      label: "À encaisser",
      value: formatEuros(aEncaisserCents),
      note: `${impayes.length} facture${impayes.length > 1 ? "s" : ""} - ${formatEuros(impayesCents)}`,
    },
    { label: "Leads en cours", value: String(leadsEnCours) },
    { label: "Projets actifs", value: String(projetsActifs) },
  ];

  const recentInvoices = invoices.slice(0, 6);
  const recentLeads = leads.slice(0, 6);

  return (
    <section className="space-y-10">
      <PageHeading
        title="Accueil"
        sub="Vue d'ensemble de l'activité : trésorerie, pipeline et pièces récentes."
      />

      {/* Indicateurs, en grille a filets fins facon fiche de synthese. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line md:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="bg-surface p-5">
            <p className="mono text-[0.7rem] text-muted">{t.label}</p>
            <p
              className={`title mt-2 text-2xl tabular ${
                t.accent ? "mark-citron inline-block" : ""
              }`}
            >
              {t.value}
            </p>
            {t.note && <p className="mt-1 text-xs text-muted">{t.note}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pieces recentes. */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <h2 className="title text-lg">Pièces récentes</h2>
            <Link href="/admin/argent?onglet=facturation" className="text-sm text-muted hover:text-ink">
              Facturation
            </Link>
          </div>
          {recentInvoices.length === 0 && (
            <Vide
              titre="Aucune pièce émise"
              aide="Les devis et factures apparaîtront ici dès la première émission."
            />
          )}
          <ul className="divide-y divide-line">
            {recentInvoices.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/admin/facturation/${inv.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:text-ink"
                >
                  <span className="min-w-0 flex-1 truncate">
                    <span className="title text-sm">
                      {INVOICE_KIND_LABELS[inv.kind]}{" "}
                      {inv.number ?? "(brouillon)"}
                    </span>
                    <span className="block text-xs text-muted">
                      {inv.client_name ?? "Client à renseigner"} -{" "}
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                  </span>
                  <span className="tabular shrink-0">
                    {formatEuros(inv.amount_ttc_cents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Leads recents. */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <h2 className="title text-lg">Leads récents</h2>
            <Link href="/admin/activite?onglet=leads" className="text-sm text-muted hover:text-ink">
              Pipeline
            </Link>
          </div>
          {recentLeads.length === 0 && (
            <Vide
              titre="Aucune demande reçue"
              aide="Les demandes envoyées depuis le site arrivent ici, dans la colonne « Nouveau »."
            />
          )}
          <ul className="divide-y divide-line">
            {recentLeads.map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">
                  <span className="title text-sm">{lead.name}</span>
                  <span className="block text-xs text-muted">
                    {lead.project_type}
                  </span>
                </span>
                <span className="mono shrink-0 text-xs text-muted">
                  {lead.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
