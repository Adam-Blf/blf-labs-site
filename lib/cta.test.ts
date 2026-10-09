import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CTA } from "@/content/cta";

/**
 * GARDE SUR LES LIBELLES D'APPEL A L'ACTION (regle d'Adam, 09/10/2026).
 *
 * Un bouton dit ce que le visiteur gagne, pas le geste qu'il fait. Cette garde
 * refuse que les libelles bannis reviennent, en texte de lien ou en chaine, et
 * borne la longueur des libelles partages (8 mots au plus).
 *
 * Les boutons purement fonctionnels (Accepter, Refuser, Retour, Continuer,
 * Fermer) ne sont pas vises : ils ne figurent pas dans la liste.
 */
const BANNIS = [
  "Démarrer un projet",
  "Demarrer un projet",
  "Demander un devis",
  "En savoir plus",
  "Voir le détail",
  "Voir les services",
  "Voir les réalisations",
  "Envoyer la demande",
  "Cliquez ici",
  "S'inscrire",
  "Commander ce type de projet",
  "Écrire un message",
];

function sources(dossier: string, sortie: string[] = []): string[] {
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) {
      if (entree === "node_modules" || entree === ".next") continue;
      sources(chemin, sortie);
    } else if (/\.(tsx?|mts)$/.test(entree) && !/\.test\./.test(entree)) {
      sortie.push(chemin);
    }
  }
  return sortie;
}

describe("libelles d'appel a l'action", () => {
  it("aucun libelle banni ne revient comme texte de bouton ou chaine", () => {
    const trouves: string[] = [];
    for (const dossier of ["app", "components", "content", "lib"]) {
      for (const fichier of sources(dossier)) {
        const source = readFileSync(fichier, "utf-8");
        for (const banni of BANNIS) {
          const echappe = banni.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const motif = new RegExp("(>\\s*|[\"'`])" + echappe + "\\s*(<|[\"'`])");
          if (motif.test(source)) trouves.push(`${fichier} : ${banni}`);
        }
      }
    }
    expect(trouves).toEqual([]);
  });

  it("les libelles partages tiennent en 8 mots au plus", () => {
    for (const libelle of Object.values(CTA)) {
      expect(libelle.split(/\s+/).length).toBeLessThanOrEqual(8);
    }
  });

  it("le delai promis dans un libelle existe sur la page de destination", () => {
    const commander = readFileSync("app/commander/page.tsx", "utf-8");
    expect(CTA.estimationAvecDelai).toContain("48 h ouvrées");
    expect(commander).toContain("48 heures ouvrées");
  });
});
