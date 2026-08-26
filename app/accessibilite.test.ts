import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * GARDE SUR LES PROPRIETES D'ACCESSIBILITE QUI SE PERDENT EN SILENCE.
 *
 * POURQUOI ELLE EXISTE.
 *
 * Un audit du 26/08/2026, mene a l'outil sur le site en production, a releve
 * trois defauts graves qu'aucun controle du depot ne voyait : aucun lien
 * d'evitement sur aucune page, `--faint` a 2,74:1 sur le papier, et le violet
 * pose en texte a 2,88:1 sur le H1 de presque toutes les pages.
 *
 * Le cas de `--faint` dit tout. Le mode SOMBRE avait deja recu ce correctif, et
 * un commentaire du fichier le raconte. Le mode CLAIR ne l'avait jamais recu,
 * et le bloc « Contrastes mesures » en tete de `themes.css` listait le jeton
 * pour le sombre en l'omettant pour le clair. Le meme defaut, dans l'autre
 * mode, laisse en place - parce que la mesure vivait dans un COMMENTAIRE au
 * lieu de vivre dans un controle.
 *
 * D'ou la forme de cette garde : elle CALCULE les ratios depuis les valeurs
 * reelles du fichier, et elle mesure CHAQUE MODE CONTRE SON PROPRE FOND. Le
 * mode sombre redefinit `--paper` ; un controle qui ne regarde qu'un seul jeu
 * de valeurs rend un vert sur la moitie du site.
 *
 * Elle a d'ailleurs paye ce point immediatement : corriger le violet en clair
 * le faisait tomber de 6,15:1 a 3,78:1 en sombre, soit une REGRESSION sur le
 * H1 de chaque page, introduite par le correctif lui-meme.
 */

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const canaux = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * canaux[0] + 0.7152 * canaux[1] + 0.0722 * canaux[2];
}

function contraste(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const THEMES = readFileSync("app/themes.css", "utf-8");

/**
 * Les valeurs du mode clair vivent dans `:root`, celles du mode sombre dans le
 * bloc `.dark`. Decouper sur ce marqueur est ce qui permet de mesurer chaque
 * jeton contre le fond qui lui fait vraiment face.
 */
const [BLOC_CLAIR, BLOC_SOMBRE] = (() => {
  const i = THEMES.indexOf("/* ---- Mode sombre ---- */");
  if (i < 0) throw new Error("bloc du mode sombre introuvable dans themes.css");
  return [THEMES.slice(0, i), THEMES.slice(i)];
})();

function jeton(bloc: string, nom: string): string {
  const trouve = bloc.match(new RegExp("--" + nom + ":[^;#]*(#[0-9a-fA-F]{6})"));
  if (!trouve) throw new Error(`jeton --${nom} introuvable dans ce mode`);
  return trouve[1];
}

/** Seuil AA pour du texte courant. Les grands titres tolerent 3:1, mais aucun
 *  de ces jetons n'est reserve aux grands titres. */
const AA = 4.5;

describe("contrastes des jetons poses en texte, mode par mode", () => {
  for (const [mode, bloc] of [
    ["clair", BLOC_CLAIR],
    ["sombre", BLOC_SOMBRE],
  ] as const) {
    const fond = jeton(bloc, "paper");

    /**
     * `--faint` porte les surtitres de section, le pied de page et le fil
     * d'Ariane : du texte courant, donc 4,5:1 et non 3:1.
     */
    it(`--faint tient AA sur --paper en mode ${mode}`, () => {
      expect(contraste(jeton(bloc, "faint"), fond)).toBeGreaterThanOrEqual(AA);
    });

    /**
     * Le violet reste une teinte CLAIRE. En aplat avec encre noire il rend
     * 8,1:1 et va tres bien ; c'est son usage en TEXTE qui echouait, et
     * seulement en mode clair. D'ou un jeton distinct qui bascule par mode,
     * et non une retouche du violet de marque.
     */
    it(`--violet-encre tient AA sur --paper en mode ${mode}`, () => {
      expect(contraste(jeton(bloc, "violet-encre"), fond)).toBeGreaterThanOrEqual(AA);
    });
  }

  /**
   * La regle qui a produit le defaut : `.grad-text` habille le H1 de presque
   * toutes les pages. S'il repasse sur le violet de marque, le titre retombe
   * a 2,88:1 en clair sans que rien ne le signale.
   */
  it(".grad-text emploie le jeton d'encre, pas le violet de marque", () => {
    const css = readFileSync("app/globals.css", "utf-8").replace(/\s+/g, " ");
    expect(css).toContain(".grad-text { color: var(--violet-encre); }");
  });
});

describe("lien d'evitement", () => {
  it("le gabarit porte un lien vers #contenu", () => {
    const layout = readFileSync("app/layout.tsx", "utf-8").replace(/\s+/g, " ");
    expect(layout).toContain('href="#contenu"');
  });

  /**
   * LE POINT QUI COMPTE VRAIMENT ICI.
   *
   * Le lien vit dans le gabarit, sa cible vit dans chaque page. Une page
   * ajoutee plus tard avec un `<main>` nu rend le lien MORT sur cette page
   * seulement : il reste visible, il recoit le focus, et il ne mene nulle
   * part. Ni typecheck, ni lint, ni build ne voient ca.
   */
  it('chaque <main> du depot porte l\'ancre id="contenu"', () => {
    const orphelins: string[] = [];
    const parcourir = (dossier: string) => {
      for (const entree of readdirSync(dossier)) {
        const chemin = join(dossier, entree);
        if (statSync(chemin).isDirectory()) {
          parcourir(chemin);
          continue;
        }
        if (!entree.endsWith(".tsx")) continue;
        // Les commentaires sont retires AVANT de compter : la documentation du
        // lien d'evitement cite `<main>` en toutes lettres, et sans ce retrait
        // la garde se signalait elle-meme comme un defaut.
        const source = readFileSync(chemin, "utf-8")
          .replace(/\/\*[\s\S]*?\*\//g, " ")
          .replace(/\/\/[^\n]*/g, " ");
        for (const balise of source.match(/<main[^>]*>/g) ?? []) {
          if (!balise.includes('id="contenu"')) orphelins.push(`${chemin} : ${balise}`);
        }
      }
    };
    parcourir("app");
    expect(orphelins).toEqual([]);
  });
});

describe("titre de page sur les sections partagees", () => {
  /**
   * `ReferencesSection` et `Faq` sont montees deux fois : sur l'accueil, ou le
   * Hero porte deja le <h1>, et sur leur page dediee, ou elles SONT le sujet.
   * Sans le niveau explicite, ces deux pages n'ont aucun <h1>, et naviguer par
   * titres - le geste le plus courant au lecteur d'ecran - n'y donne aucun
   * point d'entree.
   */
  for (const [page, composant] of [
    ["app/references/page.tsx", "ReferencesSection"],
    ["app/questions/page.tsx", "Faq"],
  ]) {
    it(`${page} monte ${composant} en niveau 1`, () => {
      const s = readFileSync(page, "utf-8").replace(/\s+/g, " ");
      expect(s).toContain(`<${composant} niveau={1} />`);
    });
  }
});
