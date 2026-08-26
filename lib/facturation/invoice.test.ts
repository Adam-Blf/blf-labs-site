import { describe, expect, it } from "vitest";
import { validerDateEncaissement } from "@/lib/facturation/invoice";

/**
 * La date d'encaissement commande le trimestre declare a l'URSSAF et la ligne
 * du livre des recettes. Une garde qui la laisse passer fausse une declaration
 * fiscale, ce qui vaut bien un test.
 */
const AUJOURDHUI = "2026-08-25";

describe("validerDateEncaissement", () => {
  it("accepte une date passee", () => {
    expect(validerDateEncaissement("2026-06-06", AUJOURDHUI)).toEqual({ ok: true });
  });

  it("accepte la date du jour", () => {
    expect(validerDateEncaissement(AUJOURDHUI, AUJOURDHUI)).toEqual({ ok: true });
  });

  it("refuse une date future, même d'un jour", () => {
    const v = validerDateEncaissement("2026-08-26", AUJOURDHUI);
    expect(v.ok).toBe(false);
  });

  it("refuse un format autre que AAAA-MM-JJ", () => {
    for (const mauvais of ["25/08/2026", "2026-8-5", "", "hier", "20260825"]) {
      expect(validerDateEncaissement(mauvais, AUJOURDHUI).ok).toBe(false);
    }
  });

  /**
   * Le cas qui justifie a lui seul de ne pas s'arreter au format : `new Date`
   * ne refuse pas le 31 fevrier, il glisse au 3 mars. Sans la comparaison
   * aller-retour, la piece serait datee d'un jour que personne n'a saisi.
   */
  it("refuse une date bien formee mais inexistante", () => {
    expect(validerDateEncaissement("2026-02-31", AUJOURDHUI).ok).toBe(false);
    expect(validerDateEncaissement("2026-13-01", AUJOURDHUI).ok).toBe(false);
  });

  /**
   * Acceptation DELIBEREE : une facture etablie apres coup pour un travail deja
   * regle porte une date d'encaissement anterieure a son emission. C'est le cas
   * de la premiere facture du studio, emise le 25/08 pour un reglement du 06/06.
   */
  it("accepte une date anterieure a l'emission de la piece", () => {
    expect(validerDateEncaissement("2026-06-06", AUJOURDHUI)).toEqual({ ok: true });
  });
});
