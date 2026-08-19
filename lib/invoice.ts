import { SITE } from "@/lib/site";
import type { InvoiceLine, IssuerSnapshot } from "@/lib/admin-types";

/**
 * Fige l'identite legale de l'emetteur au moment de l'emission. Une facture
 * emise ne doit jamais changer si le SIRET ou l'adresse evoluent ensuite : on
 * copie donc les valeurs de SITE dans la piece, on ne les lit pas en direct.
 */
export function issuerSnapshot(): IssuerSnapshot {
  return {
    legalName: SITE.legalName,
    legalMention: SITE.legalMention,
    legalForm: SITE.legalForm,
    siren: SITE.siren,
    siret: SITE.siret,
    ape: SITE.ape,
    apeLabel: SITE.apeLabel,
    addressStreet: SITE.address.street,
    addressPostalCode: SITE.address.postalCode,
    addressCity: SITE.address.city,
    addressCountry: SITE.address.country,
    email: SITE.email,
    phone: SITE.phone,
    vat: SITE.vat,
  };
}

/**
 * Conditions de paiement par defaut, avec les mentions legales obligatoires sur
 * une facture : delai, penalites de retard (3x le taux d'interet legal, plancher
 * legal) et indemnite forfaitaire de recouvrement de 40 EUR.
 */
export function defaultPaymentTerms(): string {
  return (
    "Paiement à 30 jours à réception de la facture. " +
    "En cas de retard, pénalités au taux de trois fois l'intérêt légal et " +
    "indemnité forfaitaire de recouvrement de 40 €. Pas d'escompte pour " +
    "paiement anticipé."
  );
}

/** Echeance = date d'emission + 30 jours, au format ISO (AAAA-MM-JJ). */
export function dueDateFrom(issuedISO: string): string {
  const d = new Date(`${issuedISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 30);
  return d.toISOString().slice(0, 10);
}

/** Total d'une ligne, en centimes. Quantite x prix unitaire, arrondi au centime. */
export function lineTotalCents(line: Pick<InvoiceLine, "quantity" | "unit_price_cents">): number {
  return Math.round(line.quantity * line.unit_price_cents);
}

/** Somme des lignes, en centimes. En franchise de TVA, HT = TTC. */
export function invoiceTotalCents(lines: InvoiceLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotalCents(line), 0);
}
