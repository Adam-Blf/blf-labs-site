"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  INVOICE_KIND_LABELS,
  INVOICE_STATUS_LABELS,
  formatEuros,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/admin-types";
import {
  createInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from "@/app/admin/actions";

const STATUSES: InvoiceStatus[] = ["brouillon", "envoye", "paye", "annule"];

/** Devis et factures : création d'un brouillon puis suivi du statut. Le détail
 * (lignes, mentions, émission) se fait sur la fiche de chaque document. */
export function InvoicesPanel({ invoices }: { invoices: Invoice[] }) {
  const [pending, start] = useTransition();
  // Suppression en deux temps : un premier clic arme la confirmation sur la
  // ligne, le second supprime. Evite l'effacement accidentel sans recourir a un
  // dialog bloquant.
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="grid gap-8 md:grid-cols-[320px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="title text-lg">Nouveau document</h2>
        <form
          action={(fd) => start(() => createInvoice(fd))}
          className="mt-4 flex flex-col gap-3 text-sm"
        >
          <select name="kind" className="blk-sm bg-paper px-3 py-2 text-ink">
            <option value="devis">Devis</option>
            <option value="facture">Facture</option>
          </select>
          <select name="client_type" className="blk-sm bg-paper px-3 py-2 text-ink">
            <option value="entreprise">Professionnel</option>
            <option value="particulier">Particulier</option>
          </select>
          <input
            name="client_name"
            placeholder="Nom / raison sociale"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <input
            name="client_email"
            type="email"
            placeholder="Email (optionnel)"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <input
            name="amount_euros"
            inputMode="decimal"
            placeholder="Montant en € (optionnel)"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "…" : "Créer et composer"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted">
          Micro-entreprise : TVA non applicable, art. 293 B du CGI. La pièce est un
          brouillon modifiable ; l&apos;émission lui attribue un numéro légal.
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="title text-lg">Documents</h2>
        {invoices.length === 0 && (
          <p className="text-sm text-muted">Aucun document pour l&apos;instant.</p>
        )}
        {invoices.map((inv) => (
          <Card key={inv.id} className="flex items-center justify-between gap-4 p-4">
            <Link href={`/admin/facturation/${inv.id}`} className="min-w-0 flex-1">
              <span className="title text-sm">
                {INVOICE_KIND_LABELS[inv.kind]}
                {inv.number ? ` ${inv.number}` : " (brouillon)"}
              </span>
              <span className="block text-xs text-muted">
                {inv.client_name ?? "Client à renseigner"} -{" "}
                {formatEuros(inv.amount_ttc_cents)}
              </span>
            </Link>
            <select
              value={inv.status}
              onChange={(e) =>
                start(() =>
                  updateInvoiceStatus(inv.id, e.target.value as InvoiceStatus),
                )
              }
              disabled={pending}
              className="blk-sm shrink-0 bg-paper px-3 py-2 text-sm text-ink"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {INVOICE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            {/* Suppression reservee aux brouillons : une piece emise s'annule. */}
            {inv.status === "brouillon" &&
              (confirmId === inv.id ? (
                <span className="flex shrink-0 items-center gap-2 text-xs">
                  <button
                    onClick={() =>
                      start(() => {
                        deleteInvoice(inv.id);
                        setConfirmId(null);
                      })
                    }
                    disabled={pending}
                    className="font-bold text-ink underline"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-muted hover:text-ink"
                  >
                    Annuler
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmId(inv.id)}
                  aria-label={`Supprimer le brouillon ${INVOICE_KIND_LABELS[inv.kind]}`}
                  title="Supprimer le brouillon"
                  className="shrink-0 text-muted hover:text-ink"
                >
                  ✕
                </button>
              ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
