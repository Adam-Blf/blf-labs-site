import {
  INVOICE_KIND_LABELS,
  formatEuros,
  type Invoice,
  type InvoiceLine,
} from "@/lib/admin-types";
import { issuerSnapshot, lineTotalCents } from "@/lib/invoice";
import { RETRACTATION_INFO, retractationForm } from "@/lib/retractation";
import { SITE } from "@/lib/site";

/**
 * Document conforme : devis ou facture avec toutes les mentions obligatoires
 * (art. 242 nonies A et 293 B du CGI). L'emetteur vient du snapshot fige a
 * l'emission ; pour un brouillon pas encore emis, on retombe sur l'identite
 * courante (SITE), signalee comme non definitive.
 */
function ligne(label: string, value?: string | null) {
  if (!value) return null;
  return (
    <p className="text-sm">
      <span className="text-muted">{label} : </span>
      {value}
    </p>
  );
}

export function InvoiceDocument({
  invoice,
  lines,
}: {
  invoice: Invoice;
  lines: InvoiceLine[];
}) {
  const issuer = invoice.issuer_snapshot ?? issuerSnapshot();
  const brouillon = invoice.status === "brouillon";
  const particulier = invoice.client_type === "particulier";
  const devis = invoice.kind === "devis";
  const kindLabel = INVOICE_KIND_LABELS[invoice.kind];

  return (
    <article className="blk bg-surface p-8">
      {/* En-tete : emetteur + intitule du document. */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          {/* Logo (bitmap servi depuis public/). Le nom commercial reste en
              alt pour l'accessibilite et l'impression sans images. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt={SITE.brand}
            width={168}
            height={120}
            className="mb-3 h-auto w-[168px]"
          />
          <p className="text-sm">{issuer.legalName}</p>
          <p className="text-sm text-muted">{issuer.legalForm}</p>
          <p className="mt-2 text-sm">
            {issuer.addressStreet}
            <br />
            {issuer.addressPostalCode} {issuer.addressCity}
            <br />
            {issuer.addressCountry}
          </p>
          <p className="mt-2 text-sm text-muted">SIRET {issuer.siret}</p>
          <p className="text-sm text-muted">
            {issuer.email} - {issuer.phone}
          </p>
        </div>

        <div className="text-right">
          <p className="title text-2xl uppercase">{kindLabel}</p>
          <p className="mono mt-1 text-sm">
            {invoice.number ?? "Brouillon (non émis)"}
          </p>
          {invoice.issued_at && (
            <p className="mt-2 text-sm text-muted">
              Émis le {invoice.issued_at}
            </p>
          )}
          {invoice.due_date && (
            <p className="text-sm text-muted">
              {devis ? "Valable jusqu'au" : "Échéance le"} {invoice.due_date}
            </p>
          )}
          {invoice.service_date &&
            invoice.service_date !== invoice.issued_at && (
              <p className="text-sm text-muted">
                Prestation réalisée le {invoice.service_date}
              </p>
            )}
        </div>
      </header>

      {/* Acheteur. */}
      <section className="mt-8 blk-flat bg-paper p-5">
        <p className="mono text-xs text-muted">Adressé à</p>
        <p className="mt-1 font-medium">
          {invoice.client_name ?? "Client à renseigner"}
        </p>
        {ligne("Email", invoice.client_email)}
        {(invoice.client_address_street ||
          invoice.client_city ||
          invoice.client_postal_code) && (
          <p className="mt-1 text-sm">
            {invoice.client_address_street}
            {invoice.client_address_street && <br />}
            {invoice.client_postal_code} {invoice.client_city}
            {invoice.client_country ? ` - ${invoice.client_country}` : ""}
          </p>
        )}
        {invoice.client_type === "entreprise" &&
          ligne("SIREN / SIRET", invoice.client_siren)}
      </section>

      {/* Lignes. */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 pr-3 font-medium">Désignation</th>
              <th className="py-2 px-3 text-right font-medium">Qté</th>
              <th className="py-2 px-3 text-right font-medium">PU HT</th>
              <th className="py-2 pl-3 text-right font-medium">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-muted">
                  Aucune ligne pour l&apos;instant.
                </td>
              </tr>
            )}
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-line/60">
                <td className="py-2 pr-3">{line.designation}</td>
                <td className="tabular py-2 px-3 text-right">{line.quantity}</td>
                <td className="tabular py-2 px-3 text-right">
                  {formatEuros(line.unit_price_cents)}
                </td>
                <td className="tabular py-2 pl-3 text-right">
                  {formatEuros(lineTotalCents(line))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux + franchise de TVA. */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Total HT</span>
            <span className="tabular">{formatEuros(invoice.amount_ht_cents)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>TVA</span>
            <span>-</span>
          </div>
          <div className="flex justify-between border-t border-line pt-1 font-medium">
            <span>{devis ? "Montant du devis" : "Total à payer"}</span>
            <span className="tabular">
              {formatEuros(invoice.amount_ttc_cents)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium">{issuer.vat}</p>

      {/* Conditions de paiement (mention obligatoire sur une facture). */}
      {invoice.payment_terms && (
        <p className="mt-6 text-sm text-muted">{invoice.payment_terms}</p>
      )}

      {/* Mediateur de la consommation : obligatoire face a un particulier. */}
      {particulier && (
        <p className="mt-3 text-xs text-muted">
          Médiation de la consommation : {SITE.mediator.fullName} (
          {SITE.mediator.name}), {SITE.mediator.address} - {SITE.mediator.url}
        </p>
      )}

      {/*
        Droit de retractation : obligatoire sur un DEVIS adresse a un
        particulier, car le contrat se noue a sa signature. Voir lib/retractation.
      */}
      {devis && particulier && (
        <div className="mt-4 blk-flat bg-paper p-4 text-xs text-muted">
          <p className="font-medium text-ink">Droit de rétractation</p>
          <p className="mt-1">{RETRACTATION_INFO}</p>
          <p className="mt-2">
            Formulaire type de rétractation (annexe à l&apos;article R. 221-1 du
            Code de la consommation), à recopier et à envoyer à {SITE.email} :
          </p>
          <p className="mt-1 italic">« {retractationForm()} »</p>
        </div>
      )}

      <footer className="mt-6 border-t border-line pt-3 text-xs text-muted">
        {issuer.legalMention} - SIRET {issuer.siret} - {issuer.email}
        {brouillon && (
          <span className="ml-2 text-support">
            - Brouillon : identité non figée tant que la pièce n&apos;est pas
            émise.
          </span>
        )}
      </footer>
    </article>
  );
}
