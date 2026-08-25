import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * GARDE SUR LE CONTENU D'UN CONTRAT.
 *
 * Chaque mention listee ici est exigee par un texte, et sa disparition serait
 * un manquement, pas un detail de redaction. Le motif dit lequel.
 *
 * Ce que cette garde protege reellement : une mention retiree par inadvertance
 * d'un contrat n'echoue NULLE PART. Le typecheck passe, le lint passe, le build
 * passe, la page s'affiche normalement. Rien ne proteste. Seul un test qui
 * cherche la mention la voit disparaitre.
 *
 * Le fichier est lu comme du TEXTE et non importe comme un module. C'est
 * volontaire : la premiere version de cette garde rendait le composant en
 * balisage pour le comparer, ce qui a fait echouer le build parce que
 * `react-dom/server` est interdit dans une route d'application. Lire la source
 * ne depend d'aucun rendu, d'aucune fonte et d'aucun environnement.
 *
 * Limite a connaitre : une mention peut être presente dans le fichier sans être
 * AFFICHEE, par exemple dans un commentaire. Le controle porte donc sur ce que
 * le fichier contient, pas sur ce que le visiteur lit. Pour ce qui compte ici -
 * une suppression accidentelle - c'est suffisant, et c'est dit plutot que
 * suppose.
 */

/**
 * Le corpus reunit la page ET `lib/site.ts`, parce que des mentions comme la
 * franchise de TVA vivent dans une constante partagee et sont interpolees dans
 * la page. Chercher uniquement dans la page les rendait introuvables.
 *
 * Les espaces sont normalises, parce que le JSX coupe les phrases sur plusieurs
 * lignes : « quinze jours » s'y ecrit avec un retour a la ligne au milieu, et
 * une recherche de sous-chaine brute echouait sur une phrase pourtant bien
 * presente. Les deux defauts ont ete trouves en cassant volontairement la
 * garde, pas en la relisant.
 */
const SOURCE = [
  readFileSync("app/legal/cgv/page.tsx", "utf-8"),
  readFileSync("lib/site.ts", "utf-8"),
]
  .join(" ")
  .replace(/\s+/g, " ");

const MENTIONS: Array<[string, string]> = [
  ["293 B", "franchise en base de TVA, mention exigee sur les pieces"],
  [
    "L. 224-25-12",
    "garantie légale de conformite des contenus et services numériques, d'ordre public",
  ],
  ["1641", "garantie légale contre les vices caches"],
  [
    "L. 242-18-1",
    "amende civile encourue par le professionnel qui fait obstacle a la garantie légale",
  ],
  [
    "R. 221-1",
    "formulaire type de rétractation, dont l'absence porte le délai de quatorze jours a douze mois",
  ],
  ["L. 221-18", "droit de rétractation du consommateur"],
  ["L. 612-1", "recours gratuit au médiateur de la consommation"],
  ["L. 441-10", "pénalités de retard, reservees aux professionnels"],
  [
    "quatre-vingt-dix jours",
    "duree de la garantie commerciale, qui doit être declaree (L. 217-22)",
  ],
  ["quinze jours", "délai de recette, qui borne le périmètre du projet"],
  ["600", "plancher de prix, élément de determination du prix (L. 441-1, I)"],
  ["1 300", "second palier de prix"],
  ["30 €", "taux horaire, mode de calcul exige par L112-3"],
  ["Version du", "datation, sans laquelle on ignore quelle version fait foi"],
];

describe("mentions que les CGV ne peuvent pas perdre", () => {
  for (const [mention, motif] of MENTIONS) {
    it(`porte « ${mention} » : ${motif}`, () => {
      expect(SOURCE).toContain(mention);
    });
  }
});

describe("ce que les CGV ne doivent PAS dire", () => {
  /**
   * Le plafond de responsabilité oppose a un consommateur est la clause noire
   * de l'article R. 212-1, 6° : presomption irrefragable, clause reputee non
   * ecrite. Il ne peut viser que les professionnels.
   */
  it("ne plafonne la responsabilité qu'entre professionnels", () => {
    const plafond = SOURCE.indexOf("plafonnée au montant de la prestation");
    expect(plafond).toBeGreaterThan(-1);
    const contexte = SOURCE.slice(Math.max(0, plafond - 400), plafond);
    expect(contexte).toContain("Clients professionnels");
  });

  /**
   * « Nets de TVA » signifie DEDUCTION FAITE de la TVA dans l'usage
   * commercial, donc l'inverse de ce qu'on veut dire en franchise de base.
   */
  it("n'emploie ni « HT » ni « nets de TVA » pour qualifier un prix", () => {
    expect(SOURCE).not.toContain("nets de TVA");
    expect(SOURCE).not.toMatch(/\d\s*€\s*HT/);
  });
});
