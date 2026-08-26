import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FOURCHETTES, TAUX_HORAIRE } from "@/content/tarifs";

/**
 * GARDE SUR LES MENTIONS DE LA PAGE DES BUDGETS.
 *
 * POURQUOI ELLE EXISTE, ET CE QU'ELLE AURAIT DU ARRETER.
 *
 * Le 26/08/2026, un decoupage du fichier de page a SUPPRIME deux blocs
 * juridiques : le mode de calcul exige par l'article L112-3 pour les
 * prestations sans plancher, et les mentions substantielles que l'article
 * L121-3 attache a toute page affichant un prix.
 *
 * Rien n'a proteste. Le typecheck est passe, le build est passe, la page
 * s'affichait. Les 46 tests sont restes verts, parce que la garde existante ne
 * couvrait que les conditions generales. Le defaut a ete trouve par hasard, en
 * regardant pourquoi deux imports etaient devenus inutilises.
 *
 * Une garde qui protege UNE page ne protege pas l'autre. Celle-ci couvre la
 * seconde surface du site qui porte des obligations d'information.
 */

/**
 * Le corpus inclut `content/tarifs.ts`, et pas seulement le composant et la
 * page. Les mentions communes - qualification du prix, exclusions, date
 * d'effet - vivent dans des constantes partagees et sont interpolees a
 * l'affichage : les chercher uniquement dans le balisage les rendait
 * introuvables. C'est le meme angle mort que la garde des CGV avait deja
 * paye, et il a fallu le repayer ici pour le voir.
 */
const SOURCE = [
  readFileSync("components/marketing/Tarifs.tsx", "utf-8"),
  readFileSync("app/tarifs/page.tsx", "utf-8"),
  readFileSync("content/tarifs.ts", "utf-8"),
]
  .join(" ")
  .replace(/\s+/g, " ");

const MENTIONS: Array<[string, string]> = [
  [
    "293 B",
    "franchise en base : le visiteur doit savoir qu'aucune taxe ne s'ajoute",
  ],
  [
    "de l&rsquo;heure",
    "taux horaire, seul mode de calcul publie pour les familles sans plancher (L112-3)",
  ],
  [
    "quatorze jours",
    "droit de retractation, mention substantielle d'une invitation a l'achat (L121-3)",
  ],
  [
    "conditions générales de vente",
    "renvoi au contrat, ou figure le formulaire type de retractation",
  ],
  [
    "trente jours",
    "modalites de paiement, substantielles quand elles s'ecartent des usages",
  ],
  ["legalMention", "identité du vendeur, mention substantielle"],
];

describe("mentions que la page des budgets ne peut pas perdre", () => {
  for (const [mention, motif] of MENTIONS) {
    it(`porte « ${mention} » : ${motif}`, () => {
      expect(SOURCE).toContain(mention);
    });
  }
});

describe("coherence des paliers publies", () => {
  /**
   * Un palier sans son cadre legal est un prix nu, et un prix nu affiche sans
   * dire ce qu'il ne comprend pas contrevient a l'article 3 de l'arrete du
   * 3 decembre 1987.
   */
  it("chaque palier porte sa qualification de prix et ses exclusions", () => {
    expect(FOURCHETTES.length).toBeGreaterThan(0);
    for (const f of FOURCHETTES) {
      expect(f.mention_prix, `${f.nom} : mention de prix`).toContain("293 B");
      expect(f.hors_forfait, `${f.nom} : exclusions`).toContain("nom de domaine");
      expect(f.date_effet, `${f.nom} : date d'effet`).toMatch(/\d{4}/);
      expect(f.inclus.length, `${f.nom} : contenu du palier`).toBeGreaterThan(2);
    }
  });

  /**
   * « a partir de » n'est pas une precaution de style : sans lui, le montant se
   * lit comme un prix ferme, et le premier devis superieur devient une
   * pratique trompeuse au sens de l'article L121-4.
   */
  it("chaque plancher est annonce comme un point de depart", () => {
    for (const f of FOURCHETTES) {
      expect(f.plancher.toLowerCase(), f.nom).toContain("à partir de");
    }
  });

  /**
   * En franchise en base il n'y a aucune taxe a ajouter : « HT » suggere un
   * supplement a venir, et « nets de TVA » signifie dans l'usage commercial
   * DEDUCTION FAITE de la TVA, soit l'inverse de ce qu'on veut dire.
   */
  it("aucun palier n'emploie « HT » ni « nets de TVA »", () => {
    for (const f of FOURCHETTES) {
      expect(f.plancher).not.toMatch(/\bHT\b/);
      expect(JSON.stringify(f)).not.toContain("nets de TVA");
    }
  });

  it("le taux horaire est publie et chiffre", () => {
    expect(TAUX_HORAIRE).toMatch(/\d/);
  });
});
