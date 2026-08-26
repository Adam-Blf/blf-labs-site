import type { Invoice } from "@/lib/admin/types";

/**
 * Taux de cotisation micro-entreprise. BLF Lab's = activite liberale non
 * reglementee au regime general (BNC, APE 6201Z programmation).
 *
 * A VERIFIER a la source URSSAF a chaque campagne : les taux montent par paliers.
 * Valeurs au 1er janvier 2026 (verifie le 2026-08-20) :
 *   - cotisations sociales BNC (regime general) : 25,6 % du CA encaisse
 *     (hausse de 24,6 % a 25,6 % au 01/01/2026).
 *   - contribution a la formation professionnelle (CFP) profession liberale :
 *     0,2 % du CA encaisse.
 * Ni le versement liberatoire de l'impot (option, 2,2 %), ni une taxe de chambre
 * ne sont inclus ici : ce recap couvre les cotisations sociales + CFP.
 */
export const URSSAF_RATE_BNC = 0.256;
export const CFP_RATE = 0.002;

export type Granularite = "mois" | "trimestre";

/** Clef de periode lisible et triable : "2026-08" ou "2026-T3". */
export function periodeKey(dateISO: string, granularite: Granularite): string {
  const year = dateISO.slice(0, 4);
  const month = Number(dateISO.slice(5, 7));
  if (granularite === "mois") return `${year}-${dateISO.slice(5, 7)}`;
  const trimestre = Math.floor((month - 1) / 3) + 1;
  return `${year}-T${trimestre}`;
}

export type LigneRecette = {
  date: string;
  numero: string;
  client: string;
  montantCents: number;
  mode: string;
};

/** Livre des recettes : factures encaissees, dans l'ordre chronologique. */
export function livreDesRecettes(invoices: Invoice[]): LigneRecette[] {
  return invoices
    .filter((i) => i.status === "paye" && i.paid_at)
    .sort((a, b) => (a.paid_at! < b.paid_at! ? -1 : 1))
    .map((i) => ({
      date: i.paid_at!,
      numero: i.number ?? "-",
      client: i.client_name ?? "-",
      montantCents: i.amount_ttc_cents,
      mode: i.payment_method ?? "-",
    }));
}

/** Tresorerie : encaisse (paye) vs a encaisser (emis, pas encore paye). */
export function tresorerie(invoices: Invoice[]): {
  encaisseCents: number;
  aEncaisserCents: number;
} {
  let encaisseCents = 0;
  let aEncaisserCents = 0;
  for (const i of invoices) {
    if (i.status === "paye") encaisseCents += i.amount_ttc_cents;
    else if (i.status === "envoye") aEncaisserCents += i.amount_ttc_cents;
  }
  return { encaisseCents, aEncaisserCents };
}

export type RecapPeriode = {
  periode: string;
  caCents: number;
  cotisationsCents: number;
  cfpCents: number;
  totalDuCents: number;
};

/** Recap URSSAF : CA encaisse par periode + cotisations dues au taux en vigueur. */
export function recapUrssaf(
  invoices: Invoice[],
  granularite: Granularite,
): RecapPeriode[] {
  const parPeriode = new Map<string, number>();
  for (const i of invoices) {
    if (i.status !== "paye" || !i.paid_at) continue;
    const key = periodeKey(i.paid_at, granularite);
    parPeriode.set(key, (parPeriode.get(key) ?? 0) + i.amount_ttc_cents);
  }
  return [...parPeriode.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([periode, caCents]) => {
      const cotisationsCents = Math.round(caCents * URSSAF_RATE_BNC);
      const cfpCents = Math.round(caCents * CFP_RATE);
      return {
        periode,
        caCents,
        cotisationsCents,
        cfpCents,
        totalDuCents: cotisationsCents + cfpCents,
      };
    });
}
