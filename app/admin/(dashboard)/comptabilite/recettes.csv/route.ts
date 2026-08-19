import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { INVOICE_COLUMNS, type Invoice } from "@/lib/admin-types";
import { livreDesRecettes } from "@/lib/urssaf";

export const runtime = "nodejs";

/** Export CSV du livre des recettes (separateur ; pour Excel FR, UTF-8 BOM pour
 * les accents). Lecture RLS-gated : un appel non authentifie ne trouve rien. */
function champ(v: string): string {
  return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function euros(cents: number): string {
  return `${Math.floor(cents / 100)},${(Math.abs(cents) % 100)
    .toString()
    .padStart(2, "0")}`;
}

export async function GET() {
  const supabase = await supabaseServer();
  if (!supabase) return new NextResponse("Indisponible", { status: 503 });

  const { data } = await supabase.from("invoices").select(INVOICE_COLUMNS);
  const recettes = livreDesRecettes((data ?? []) as Invoice[]);

  const header = "Date;Numéro;Client;Mode de règlement;Montant TTC (EUR)";
  const rows = recettes.map((r) =>
    [r.date, r.numero, r.client, r.mode, euros(r.montantCents)]
      .map((c) => champ(String(c)))
      .join(";"),
  );
  // BOM UTF-8 : sans lui, Excel lit le fichier en Windows-1252 et casse les accents.
  const csv = "﻿" + [header, ...rows].join("\r\n") + "\r\n";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="livre-des-recettes.csv"',
      "Cache-Control": "no-store",
    },
  });
}
