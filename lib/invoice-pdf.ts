import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { SITE } from "@/lib/site";
import { issuerSnapshot, lineTotalCents } from "@/lib/invoice";
import { RETRACTATION_INFO, retractationForm } from "@/lib/retractation";
import { LOGO_PNG_BASE64, LOGO_PNG_WIDTH, LOGO_PNG_HEIGHT } from "@/lib/logo";
import {
  INVOICE_KIND_LABELS,
  type Invoice,
  type InvoiceLine,
} from "@/lib/admin-types";

/**
 * Rendu PDF d'un devis / d'une facture, avec toutes les mentions obligatoires.
 *
 * pdf-lib + police standard Helvetica (encodage WinAnsi). Consequence a
 * connaitre : les montants sont formates a la main, pas avec `Intl`, car le
 * format francais insere une espace fine insecable (U+202F) que WinAnsi ne sait
 * pas dessiner et qui ferait planter le rendu. Le symbole euro et les accents,
 * eux, sont dans WinAnsi.
 */

/** "1 234,56 EUR" avec des espaces normales, sans caractere hors WinAnsi. */
function euros(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const n = Math.abs(cents);
  const whole = Math.floor(n / 100).toString();
  const dec = (n % 100).toString().padStart(2, "0");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${grouped},${dec} EUR`;
}

/** Decoupe un texte en lignes qui tiennent dans `maxWidth` a la taille donnee. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderInvoicePdf(
  invoice: Invoice,
  lines: InvoiceLine[],
): Promise<Uint8Array> {
  const issuer = invoice.issuer_snapshot ?? issuerSnapshot();
  const particulier = invoice.client_type === "particulier";
  const devis = invoice.kind === "devis";

  const doc = await PDFDocument.create();
  doc.setTitle(
    `${INVOICE_KIND_LABELS[invoice.kind]} ${invoice.number ?? "brouillon"}`,
  );
  doc.setProducer(SITE.brand);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([595.28, 841.89]); // A4
  const M = 50;
  const right = 595.28 - M;
  const ink = rgb(0.07, 0.06, 0.09);
  const muted = rgb(0.4, 0.38, 0.43);
  let y = 841.89 - M;

  const text = (
    s: string,
    x: number,
    yy: number,
    opts: { size?: number; font?: PDFFont; color?: typeof ink } = {},
  ) => {
    page.drawText(s, {
      x,
      y: yy,
      size: opts.size ?? 10,
      font: opts.font ?? font,
      color: opts.color ?? ink,
    });
  };
  const textRight = (
    s: string,
    xRight: number,
    yy: number,
    opts: { size?: number; font?: PDFFont; color?: typeof ink } = {},
  ) => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    text(s, xRight - f.widthOfTextAtSize(s, size), yy, opts);
  };

  // En-tete emetteur : logo a gauche, type de piece a droite.
  const logo = await doc.embedPng(LOGO_PNG_BASE64);
  const logoW = 108;
  const logoH = (logoW * LOGO_PNG_HEIGHT) / LOGO_PNG_WIDTH;
  page.drawImage(logo, { x: M, y: y - logoH, width: logoW, height: logoH });

  textRight(INVOICE_KIND_LABELS[invoice.kind].toUpperCase(), right, y, {
    size: 18,
    font: bold,
  });
  y -= 18;
  textRight(invoice.number ?? "Brouillon (non émis)", right, y, {
    size: 10,
    color: muted,
  });

  // L'identite legale de l'emetteur se pose sous le logo.
  y -= logoH - 18 + 14;
  for (const l of [
    issuer.legalName,
    issuer.legalForm,
    issuer.addressStreet,
    `${issuer.addressPostalCode} ${issuer.addressCity}`,
    issuer.addressCountry,
    `SIRET ${issuer.siret}`,
    `${issuer.email} - ${issuer.phone}`,
  ]) {
    text(l, M, y, { size: 9, color: muted });
    y -= 12;
  }

  // Dates a droite.
  let yr = 841.89 - M - 52;
  if (invoice.issued_at) {
    textRight(`Émis le ${invoice.issued_at}`, right, yr, { size: 9, color: muted });
    yr -= 12;
  }
  if (invoice.due_date) {
    const dueLabel = devis ? "Valable jusqu'au" : "Échéance le";
    textRight(`${dueLabel} ${invoice.due_date}`, right, yr, { size: 9, color: muted });
    yr -= 12;
  }
  if (invoice.service_date && invoice.service_date !== invoice.issued_at) {
    textRight(`Prestation réalisée le ${invoice.service_date}`, right, yr, {
      size: 9,
      color: muted,
    });
  }

  // Acheteur.
  y -= 14;
  text("Adressé à", M, y, { size: 8, font: bold, color: muted });
  y -= 14;
  text(invoice.client_name ?? "Client à renseigner", M, y, { size: 11, font: bold });
  y -= 13;
  for (const l of [
    invoice.client_email ?? "",
    invoice.client_address_street ?? "",
    `${invoice.client_postal_code ?? ""} ${invoice.client_city ?? ""}`.trim(),
    invoice.client_country ?? "",
    invoice.client_type === "entreprise" && invoice.client_siren
      ? `SIREN / SIRET : ${invoice.client_siren}`
      : "",
  ].filter(Boolean)) {
    text(l, M, y, { size: 9, color: muted });
    y -= 12;
  }

  // Tableau des lignes.
  y -= 16;
  const colQte = right - 200;
  const colPu = right - 120;
  const colTot = right;
  text("Désignation", M, y, { size: 9, font: bold, color: muted });
  textRight("Qté", colQte + 20, y, { size: 9, font: bold, color: muted });
  textRight("PU HT", colPu + 10, y, { size: 9, font: bold, color: muted });
  textRight("Total HT", colTot, y, { size: 9, font: bold, color: muted });
  y -= 6;
  page.drawLine({ start: { x: M, y }, end: { x: right, y }, color: muted, thickness: 0.5 });
  y -= 14;

  for (const line of lines) {
    const wrapped = wrap(line.designation, font, 10, colQte - M - 10);
    text(wrapped[0] ?? "", M, y, { size: 10 });
    textRight(String(line.quantity), colQte + 20, y, { size: 10 });
    textRight(euros(line.unit_price_cents), colPu + 10, y, { size: 10 });
    textRight(euros(lineTotalCents(line)), colTot, y, { size: 10 });
    y -= 12;
    for (const extra of wrapped.slice(1)) {
      text(extra, M, y, { size: 10 });
      y -= 12;
    }
    y -= 3;
  }

  // Totaux.
  y -= 6;
  page.drawLine({ start: { x: colQte, y }, end: { x: right, y }, color: muted, thickness: 0.5 });
  y -= 16;
  text("Total HT", colQte, y, { size: 10, color: muted });
  textRight(euros(invoice.amount_ht_cents), colTot, y, { size: 10 });
  y -= 14;
  text("TVA", colQte, y, { size: 10, color: muted });
  textRight("-", colTot, y, { size: 10, color: muted });
  y -= 16;
  text(devis ? "Montant du devis" : "Total à payer", colQte, y, { size: 11, font: bold });
  textRight(euros(invoice.amount_ttc_cents), colTot, y, { size: 11, font: bold });

  // Mention TVA (293 B).
  y -= 28;
  text(issuer.vat, M, y, { size: 9, font: bold });

  // Conditions de paiement.
  if (invoice.payment_terms) {
    y -= 18;
    for (const l of wrap(invoice.payment_terms, font, 8, right - M)) {
      text(l, M, y, { size: 8, color: muted });
      y -= 10;
    }
  }

  // Mediateur (obligatoire face a un particulier).
  if (particulier) {
    y -= 8;
    const med = `Médiation de la consommation : ${SITE.mediator.fullName} (${SITE.mediator.name}), ${SITE.mediator.address} - ${SITE.mediator.url}`;
    for (const l of wrap(med, font, 8, right - M)) {
      text(l, M, y, { size: 8, color: muted });
      y -= 10;
    }
  }

  // Droit de retractation : obligatoire sur un DEVIS adresse a un particulier
  // (le contrat se noue a la signature du devis). Voir lib/retractation.
  if (devis && particulier) {
    y -= 10;
    text("Droit de rétractation", M, y, { size: 9, font: bold });
    y -= 12;
    const intro = `Formulaire type (annexe art. R. 221-1), à recopier et à envoyer à ${issuer.email} :`;
    for (const block of [RETRACTATION_INFO, intro, retractationForm()]) {
      for (const l of wrap(block, font, 8, right - M)) {
        text(l, M, y, { size: 8, color: muted });
        y -= 10;
      }
      y -= 3;
    }
  }

  // Pied de page legal.
  const footer = `${issuer.legalMention} - SIRET ${issuer.siret} - ${issuer.email}`;
  text(footer, M, M, { size: 8, color: muted });

  return doc.save();
}
