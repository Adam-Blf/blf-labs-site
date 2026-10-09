import { Vector2 } from "three";

/**
 * Profil de révolution de la fiole, en géométrie pure.
 *
 * Le logo du studio est un erlenmeyer dont le niveau de liquide dessine la barre
 * du A. La scène du hero ne pose donc pas une forme abstraite de plus : elle
 * rend le même objet en volume. C'est ce qui la rattache à la marque au lieu
 * d'en faire un décor interchangeable.
 *
 * Ce fichier ne contient aucun rendu, aucun état et aucune dépendance React :
 * c'est de la géométrie, elle se teste sans navigateur (voir flaskProfile.test.ts).
 *
 * Repère : x est le rayon, y la hauteur, l'origine au centre du volume. Le
 * profil est fermé en haut comme en bas, on rend un volume plein et non une
 * coque ouverte. Un verre à réfraction sur une coque laisse voir la face
 * arrière et donne un objet creux et sale.
 */
export type ProfilePoint = readonly [x: number, y: number];

export const FLASK_BOTTOM = -1;
export const FLASK_TOP = 1.04;

/**
 * Silhouette d'erlenmeyer : base large, épaulement conique, col étroit, lèvre.
 * Les points vont du bas vers le haut, l'axe de révolution est x = 0.
 */
export const FLASK_PROFILE: readonly ProfilePoint[] = [
  [0, FLASK_BOTTOM],
  [0.86, FLASK_BOTTOM],
  [0.88, -0.94],
  [0.72, -0.62],
  [0.54, -0.28],
  [0.36, 0.08],
  [0.23, 0.4],
  [0.2, 0.62],
  [0.2, 0.9],
  [0.27, 0.98],
  [0.24, FLASK_TOP],
  [0, FLASK_TOP],
];

/** Points du verre, prêts à passer à une `LatheGeometry`. */
export function flaskPoints(): Vector2[] {
  return FLASK_PROFILE.map(([x, y]) => new Vector2(x, y));
}

/**
 * Rayon du verre à une hauteur donnée, par interpolation linéaire entre les
 * deux points encadrants. Hors du volume, on renvoie le rayon de l'extrémité la
 * plus proche plutôt que zéro : cela évite un liquide qui se pince en pointe
 * quand le niveau dépasse légèrement les bornes.
 */
export function radiusAt(height: number): number {
  const points = FLASK_PROFILE;

  if (height <= points[0][1]) return points[0][0];

  for (let i = 1; i < points.length; i += 1) {
    const [prevX, prevY] = points[i - 1];
    const [x, y] = points[i];

    if (height <= y) {
      // Deux points à la même hauteur : segment horizontal, pas d'interpolation
      // possible, on prend le rayon du point haut.
      if (y === prevY) return x;
      const t = (height - prevY) / (y - prevY);
      return prevX + (x - prevX) * t;
    }
  }

  return points[points.length - 1][0];
}

/**
 * Profil du liquide pour un remplissage donné.
 *
 * `fill` va de 0 (vide) à 1 (plein jusqu'à la lèvre). Le volume rendu est
 * légèrement rentré dans le verre par `INSET` : sans ce retrait, les deux
 * surfaces se superposent exactement et le rendu part en z-fighting, ce qui se
 * voit comme un scintillement sur les bords dès que la caméra bouge.
 *
 * Le profil renvoyé est toujours fermé : fond, paroi, puis surface plane du
 * liquide ramenée à l'axe.
 */
const INSET = 0.03;

export function liquidPoints(fill: number): Vector2[] {
  const clamped = Math.min(Math.max(fill, 0), 1);
  const surface = FLASK_BOTTOM + (FLASK_TOP - FLASK_BOTTOM) * clamped;

  const points: Vector2[] = [new Vector2(0, FLASK_BOTTOM + INSET)];

  for (const [x, y] of FLASK_PROFILE) {
    if (y <= FLASK_BOTTOM) continue;
    if (y >= surface) break;
    points.push(new Vector2(Math.max(x - INSET, 0), y));
  }

  // Surface libre du liquide, puis fermeture sur l'axe.
  points.push(new Vector2(Math.max(radiusAt(surface) - INSET, 0), surface));
  points.push(new Vector2(0, surface));

  return points;
}
