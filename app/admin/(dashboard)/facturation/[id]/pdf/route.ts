import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { INVOICE_COLUMNS, type Invoice, type InvoiceLine } from "@/lib/admin/types";
import { renderInvoicePdf } from "@/lib/facturation/invoice-pdf";

// pdf-lib a besoin du runtime Node (pas Edge).
export const runtime = "nodejs";

/**
 * Telechargement du PDF d'un devis / d'une facture. La lecture passe par la
 * session (RLS is_blf_admin + aal2) : un appel non authentifie ne trouve rien.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await supabaseServer();
  if (!supabase) return new NextResponse("Indisponible", { status: 503 });

  const [{ data: invoiceData }, { data: linesData }] = await Promise.all([
    supabase.from("invoices").select(INVOICE_COLUMNS).eq("id", id).single(),
    supabase
      .from("invoice_lines")
      .select("id, invoice_id, designation, quantity, unit_price_cents, position")
      .eq("invoice_id", id)
      .order("position", { ascending: true }),
  ]);

  if (!invoiceData) return new NextResponse("Introuvable", { status: 404 });

  const invoice = invoiceData as Invoice;
  const lines = (linesData ?? []) as InvoiceLine[];
  const pdf = await renderInvoicePdf(invoice, lines);

  const name = (invoice.number ?? `brouillon-${id.slice(0, 8)}`).replace(
    /[^A-Za-z0-9._-]/g,
    "_",
  );

  // Copie dans un Uint8Array adosse a un ArrayBuffer propre : satisfait le type
  // BodyInit (BufferSource) sans dependre du buffer d'origine de pdf-lib.
  const body = new Uint8Array(pdf);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
