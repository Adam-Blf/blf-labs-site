import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { INVOICE_COLUMNS, formatEuros, type Invoice } from "@/lib/admin/types";
import {
  URSSAF_RATE_BNC,
  CFP_RATE,
  livreDesRecettes,
  recapUrssaf,
  tresorerie,
  type Granularite,
} from "@/lib/facturation/urssaf";

/** Comptabilite : tresorerie, recap URSSAF et livre des recettes, derives des
 * factures. Prepare les montants a declarer ; ne soumet rien a l'URSSAF. */
export async function SectionComptabilite({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const granularite: Granularite = p === "mois" ? "mois" : "trimestre";

  const supabase = await supabaseServer();
  const { data } = supabase
    ? await supabase.from("invoices").select(INVOICE_COLUMNS)
    : { data: null };
  const invoices = (data ?? []) as Invoice[];

  const { encaisseCents, aEncaisserCents } = tresorerie(invoices);
  const recap = recapUrssaf(invoices, granularite);
  const recettes = livreDesRecettes(invoices);
  const pct = (r: number) => `${(r * 100).toLocaleString("fr-FR")} %`;

  return (
    <section className="space-y-10">

      {/* Tresorerie. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="blk-sm bg-surface p-5">
          <p className="text-sm text-muted">Encaissé</p>
          <p className="title mt-1 text-xl">{formatEuros(encaisseCents)}</p>
        </div>
        <div className="blk-sm bg-surface p-5">
          <p className="text-sm text-muted">À encaisser (émis, non payé)</p>
          <p className="title mt-1 text-xl">{formatEuros(aEncaisserCents)}</p>
        </div>
      </div>

      {/* Recap URSSAF. */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="title text-lg">Récap URSSAF</h2>
          <div className="flex gap-1 text-sm">
            <Link
              href="/admin/comptabilite?p=trimestre"
              className={`blk-sm px-3 py-1 ${granularite === "trimestre" ? "bg-accent text-accent-ink" : "bg-surface text-ink"}`}
            >
              Trimestre
            </Link>
            <Link
              href="/admin/comptabilite?p=mois"
              className={`blk-sm px-3 py-1 ${granularite === "mois" ? "bg-accent text-accent-ink" : "bg-surface text-ink"}`}
            >
              Mois
            </Link>
          </div>
        </div>
        <p className="mb-3 text-xs text-muted">
          Taux appliqués (BNC libéral, 2026, à vérifier à la source) : cotisations{" "}
          {pct(URSSAF_RATE_BNC)} + CFP {pct(CFP_RATE)} du CA encaissé.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 pr-3 font-medium">Période</th>
                <th className="py-2 px-3 text-right font-medium">CA encaissé</th>
                <th className="py-2 px-3 text-right font-medium">Cotisations</th>
                <th className="py-2 px-3 text-right font-medium">CFP</th>
                <th className="py-2 pl-3 text-right font-medium">Total dû</th>
              </tr>
            </thead>
            <tbody>
              {recap.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-muted">
                    Aucune recette encaissée pour l&apos;instant.
                  </td>
                </tr>
              )}
              {recap.map((r) => (
                <tr key={r.periode} className="border-b border-line/60">
                  <td className="py-2 pr-3">{r.periode}</td>
                  <td className="tabular py-2 px-3 text-right">{formatEuros(r.caCents)}</td>
                  <td className="tabular py-2 px-3 text-right">{formatEuros(r.cotisationsCents)}</td>
                  <td className="tabular py-2 px-3 text-right">{formatEuros(r.cfpCents)}</td>
                  <td className="tabular py-2 pl-3 text-right font-medium">{formatEuros(r.totalDuCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Livre des recettes. */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="title text-lg">Livre des recettes</h2>
          <a
            href="/admin/comptabilite/recettes.csv"
            className="blk-sm bg-surface px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-strong"
          >
            Export CSV
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 px-3 font-medium">Numéro</th>
                <th className="py-2 px-3 font-medium">Client</th>
                <th className="py-2 px-3 font-medium">Mode</th>
                <th className="py-2 pl-3 text-right font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {recettes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-muted">
                    Aucune recette encaissée.
                  </td>
                </tr>
              )}
              {recettes.map((r, idx) => (
                <tr key={`${r.numero}-${idx}`} className="border-b border-line/60">
                  <td className="py-2 pr-3">{r.date}</td>
                  <td className="mono py-2 px-3">{r.numero}</td>
                  <td className="py-2 px-3">{r.client}</td>
                  <td className="py-2 px-3">{r.mode}</td>
                  <td className="tabular py-2 pl-3 text-right">{formatEuros(r.montantCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
