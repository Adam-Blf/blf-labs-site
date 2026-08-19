"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatEuros, type Invoice, type InvoiceLine } from "@/lib/admin-types";
import { lineTotalCents } from "@/lib/invoice";
import {
  addInvoiceLine,
  issueInvoice,
  removeInvoiceLine,
  updateInvoiceClient,
} from "@/app/admin/actions";

/**
 * Editeur d'un brouillon : coordonnees de l'acheteur, lignes, puis emission.
 * Une fois emise, la piece est verrouillee (numero et identite figes) : on
 * n'affiche plus que le document, plus l'editeur.
 */
export function InvoiceEditor({
  invoice,
  lines,
}: {
  invoice: Invoice;
  lines: InvoiceLine[];
}) {
  const [pending, start] = useTransition();

  if (invoice.status !== "brouillon") {
    return (
      <Card className="p-4 text-sm text-muted">
        Pièce émise le {invoice.issued_at} sous le numéro{" "}
        <span className="mono">{invoice.number}</span>. Elle est verrouillée : son
        numéro et l&apos;identité de l&apos;émetteur ne changent plus.
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="title text-lg">Acheteur</h2>
        <form
          action={(fd) => start(() => updateInvoiceClient(invoice.id, fd))}
          className="mt-4 grid gap-3 text-sm"
        >
          <select
            name="client_type"
            defaultValue={invoice.client_type}
            className="blk-sm bg-paper px-3 py-2 text-ink"
          >
            <option value="entreprise">Professionnel</option>
            <option value="particulier">Particulier</option>
          </select>
          <input name="client_name" defaultValue={invoice.client_name ?? ""} placeholder="Nom / raison sociale" className="blk-sm bg-paper px-3 py-2 text-ink" />
          <input name="client_email" type="email" defaultValue={invoice.client_email ?? ""} placeholder="Email" className="blk-sm bg-paper px-3 py-2 text-ink" />
          <input name="client_siren" defaultValue={invoice.client_siren ?? ""} placeholder="SIREN / SIRET (pro)" className="blk-sm bg-paper px-3 py-2 text-ink" />
          <input name="client_address_street" defaultValue={invoice.client_address_street ?? ""} placeholder="Adresse" className="blk-sm bg-paper px-3 py-2 text-ink" />
          <div className="grid grid-cols-2 gap-3">
            <input name="client_postal_code" defaultValue={invoice.client_postal_code ?? ""} placeholder="Code postal" className="blk-sm bg-paper px-3 py-2 text-ink" />
            <input name="client_city" defaultValue={invoice.client_city ?? ""} placeholder="Ville" className="blk-sm bg-paper px-3 py-2 text-ink" />
          </div>
          <input name="client_country" defaultValue={invoice.client_country ?? "France"} placeholder="Pays" className="blk-sm bg-paper px-3 py-2 text-ink" />
          <Button type="submit" variant="ghost" disabled={pending}>
            Enregistrer l&apos;acheteur
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="title text-lg">Lignes</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center justify-between gap-3 blk-flat bg-paper px-3 py-2">
              <span className="min-w-0 flex-1 truncate">
                {line.designation}
                <span className="text-muted">
                  {" "}
                  - {line.quantity} × {formatEuros(line.unit_price_cents)}
                </span>
              </span>
              <span className="tabular shrink-0">{formatEuros(lineTotalCents(line))}</span>
              <button
                onClick={() => start(() => removeInvoiceLine(line.id, invoice.id))}
                disabled={pending}
                aria-label={`Supprimer la ligne ${line.designation}`}
                className="shrink-0 text-muted hover:text-ink"
              >
                ✕
              </button>
            </li>
          ))}
          {lines.length === 0 && (
            <li className="text-muted">Aucune ligne. Ajoutez-en une ci-dessous.</li>
          )}
        </ul>

        <form
          action={(fd) => start(() => addInvoiceLine(invoice.id, fd))}
          className="mt-4 grid gap-2 text-sm"
        >
          <input name="designation" required placeholder="Désignation de la prestation" className="blk-sm bg-paper px-3 py-2 text-ink" />
          <div className="grid grid-cols-2 gap-2">
            <input name="quantity" inputMode="decimal" defaultValue="1" placeholder="Quantité" className="blk-sm bg-paper px-3 py-2 text-ink" />
            <input name="unit_price_euros" inputMode="decimal" placeholder="PU HT en €" className="blk-sm bg-paper px-3 py-2 text-ink" />
          </div>
          <Button type="submit" variant="ghost" disabled={pending}>
            Ajouter la ligne
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">
            Total : <span className="tabular text-ink">{formatEuros(invoice.amount_ttc_cents)}</span>
          </span>
          <Button
            onClick={() => start(() => issueInvoice(invoice.id))}
            disabled={pending || lines.length === 0}
          >
            {pending ? "…" : "Émettre (attribuer le numéro)"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
