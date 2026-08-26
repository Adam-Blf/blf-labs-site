import { SITE } from "@/lib/site";
import type { InvoiceLine, IssuerSnapshot } from "@/lib/admin/types";

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
 * Conditions de paiement par defaut.
 *
 * Le regime differe selon l'acheteur, et ce n'est pas un detail : les penalites
 * de retard et surtout l'indemnite forfaitaire de recouvrement de 40 EUR
 * (art. L441-10 II du code de commerce) sont un dispositif RESERVE aux
 * transactions entre professionnels. La reclamer a un consommateur est
 * inapplicable et s'expose a la clause abusive (art. R212-1 code de la
 * consommation). Face a un particulier, on s'en tient donc au delai et a
 * l'absence d'escompte, sans transposer le regime B2B.
 */
export function defaultPaymentTerms(clientType?: string): string {
  if (clientType === "particulier") {
    return (
      "Paiement à 30 jours à réception. " +
      "Pas d'escompte pour paiement anticipé."
    );
  }
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

/**
 * Valide une date d'encaissement saisie a la main.
 *
 * Isolee ici, et pas dans l'action serveur, pour une raison de testabilite :
 * `app/admin/actions-facturation.ts` importe Stripe et l'envoi d'email, qui
 * s'evaluent des l'import et exigent des cles. Une garde qu'on ne peut pas
 * executer dans un test est une garde qu'on n'a jamais vue rouge.
 *
 * Ce qui est refuse : un format autre que AAAA-MM-JJ, une date inexistante
 * (le 31 fevrier se presente bien au format), et une date future, parce qu'on
 * ne declare pas une recette qui n'est pas encore entree.
 *
 * Ce qui est ACCEPTE, volontairement : une date anterieure a l'emission de la
 * piece. Une facture etablie apres coup pour un travail deja regle porte
 * legitimement une date d'encaissement anterieure a sa propre emission.
 */
export function validerDateEncaissement(
  date: string,
  aujourdhuiISO: string,
): { ok: true } | { ok: false; message: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, message: "Date d'encaissement invalide." };
  }

  // `new Date("2026-02-31")` ne leve pas, il glisse au 3 mars. On compare donc
  // la date reconstruite a la chaine d'origine : un glissement la trahit.
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) {
    return { ok: false, message: "Cette date n'existe pas." };
  }

  if (date > aujourdhuiISO) {
    return {
      ok: false,
      message: "La date d'encaissement ne peut pas être dans le futur.",
    };
  }

  return { ok: true };
}
