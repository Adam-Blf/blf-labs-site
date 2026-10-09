import { describe, expect, it } from "vitest";
import {
  FLASK_BOTTOM,
  FLASK_TOP,
  flaskPoints,
  liquidPoints,
  radiusAt,
} from "./flaskProfile";

/**
 * Premier test du dépôt. `vitest` était installé sans rien à exécuter.
 *
 * Ce qui est verrouillé ici est l'invariant qui casse visuellement : le liquide
 * ne doit jamais traverser la paroi du verre. Une fois la scène rendue, une
 * fuite de quelques centièmes ne se lit pas comme une erreur de géométrie, elle
 * se lit comme un scintillement sur les bords, et on la cherche du mauvais côté.
 *
 * Ce que ces tests NE voient PAS : le rendu. Ils valident des coordonnées, pas
 * un matériau, pas une caméra, pas une couleur. Une scène parfaitement conforme
 * ici peut être illisible à l'écran.
 */
describe("flaskProfile", () => {
  it("ferme le volume du verre en haut comme en bas", () => {
    const points = flaskPoints();

    expect(points[0].x).toBe(0);
    expect(points[0].y).toBe(FLASK_BOTTOM);
    expect(points[points.length - 1].x).toBe(0);
    expect(points[points.length - 1].y).toBe(FLASK_TOP);
  });

  it("renvoie un rayon fini à toute hauteur, y compris hors bornes", () => {
    for (const height of [-5, FLASK_BOTTOM, -0.5, 0, 0.5, FLASK_TOP, 5]) {
      const radius = radiusAt(height);
      expect(Number.isFinite(radius)).toBe(true);
      expect(radius).toBeGreaterThanOrEqual(0);
    }
  });

  it("se resserre du fond vers le col", () => {
    expect(radiusAt(-0.9)).toBeGreaterThan(radiusAt(0));
    expect(radiusAt(0)).toBeGreaterThan(radiusAt(0.7));
  });

  it("borne le remplissage entre vide et plein", () => {
    const parTrop = liquidPoints(4);
    const negatif = liquidPoints(-2);

    expect(Math.max(...parTrop.map((p) => p.y))).toBeLessThanOrEqual(FLASK_TOP);
    expect(Math.min(...negatif.map((p) => p.y))).toBeGreaterThanOrEqual(
      FLASK_BOTTOM,
    );
  });

  it("monte la surface libre quand le remplissage augmente", () => {
    const bas = Math.max(...liquidPoints(0.2).map((p) => p.y));
    const haut = Math.max(...liquidPoints(0.8).map((p) => p.y));

    expect(haut).toBeGreaterThan(bas);
  });

  it("garde le liquide à l'intérieur de la paroi, à tout niveau", () => {
    for (let fill = 0; fill <= 1; fill += 0.05) {
      for (const point of liquidPoints(fill)) {
        const paroi = radiusAt(point.y);

        // Limite absolue : un point du liquide au-delà de la paroi sort du verre.
        expect(point.x).toBeLessThanOrEqual(paroi);

        // Là où le verre a une épaisseur, le liquide doit rester strictement en
        // retrait. Deux surfaces exactement confondues partent en z-fighting,
        // ce qui se voit comme un scintillement des bords dès que la caméra
        // bouge. Aux points de fermeture sur l'axe, les deux valent zéro et la
        // stricte inégalité n'a pas de sens : ce cas est exclu ici.
        if (paroi > 0) {
          expect(point.x).toBeLessThan(paroi);
        }
      }
    }
  });

  it("ferme aussi le profil du liquide sur l'axe de révolution", () => {
    const points = liquidPoints(0.5);

    expect(points[0].x).toBe(0);
    expect(points[points.length - 1].x).toBe(0);
  });
});
