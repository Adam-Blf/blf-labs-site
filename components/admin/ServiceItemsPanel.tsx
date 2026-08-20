"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatEuros, type ServiceItem } from "@/lib/admin-types";
import {
  createServiceItem,
  deleteServiceItem,
  updateServiceItem,
} from "@/app/admin/actions";

/**
 * Catalogue de prestations reutilisables. Il se remplit tout seul (chaque ligne
 * facturee y atterrit) et se gere ici a la main : ajouter, corriger un prix,
 * retirer. Le selecteur de l'editeur de facture pioche dans cette liste.
 */
export function ServiceItemsPanel({ items }: { items: ServiceItem[] }) {
  const [pending, start] = useTransition();
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <Card className="h-fit p-6">
      <h2 className="title text-lg">Prestations enregistrées</h2>
      <p className="mt-1 text-xs text-muted">
        Réutilisables à la composition d&apos;une facture. Chaque ligne facturée
        s&apos;ajoute ici automatiquement.
      </p>

      <form
        action={(fd) => start(() => createServiceItem(fd))}
        className="mt-4 grid gap-2 text-sm"
      >
        <input
          name="designation"
          required
          placeholder="Désignation"
          className="blk-sm bg-paper px-3 py-2 text-ink"
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            name="unit_price_euros"
            inputMode="decimal"
            placeholder="PU HT en €"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <Button type="submit" variant="ghost" disabled={pending}>
            Ajouter
          </Button>
        </div>
      </form>

      <ul className="mt-4 space-y-2 text-sm">
        {items.length === 0 && (
          <li className="text-muted">Aucune prestation enregistrée.</li>
        )}
        {items.map((it) =>
          editId === it.id ? (
            <li key={it.id}>
              <form
                action={(fd) =>
                  start(() => {
                    updateServiceItem(it.id, fd);
                    setEditId(null);
                  })
                }
                className="grid grid-cols-[1fr_auto_auto] items-center gap-2 blk-flat bg-paper px-3 py-2"
              >
                <input
                  name="designation"
                  defaultValue={it.designation}
                  className="blk-sm bg-surface px-2 py-1 text-ink"
                />
                <input
                  name="unit_price_euros"
                  inputMode="decimal"
                  defaultValue={(it.unit_price_cents / 100).toString()}
                  className="blk-sm w-24 bg-surface px-2 py-1 text-ink"
                />
                <span className="flex gap-2">
                  <button type="submit" className="font-bold text-ink underline">
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="text-muted hover:text-ink"
                  >
                    Annuler
                  </button>
                </span>
              </form>
            </li>
          ) : (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 blk-flat bg-paper px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate">{it.designation}</span>
              <span className="tabular shrink-0 text-muted">
                {formatEuros(it.unit_price_cents)}
              </span>
              <span className="flex shrink-0 gap-3">
                <button
                  onClick={() => setEditId(it.id)}
                  className="text-muted hover:text-ink"
                >
                  Éditer
                </button>
                <button
                  onClick={() => start(() => deleteServiceItem(it.id))}
                  disabled={pending}
                  aria-label={`Supprimer ${it.designation}`}
                  className="text-muted hover:text-ink"
                >
                  ✕
                </button>
              </span>
            </li>
          ),
        )}
      </ul>
    </Card>
  );
}
