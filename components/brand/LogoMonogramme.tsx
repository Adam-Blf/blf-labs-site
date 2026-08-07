/**
 * Piste 1 : monogramme BLF construit sur une grille.
 *
 * Chaque lettre est un assemblage de rectangles alignes sur un module de 8, ce
 * qui donne un dessin qui reste net a 16 pixels (favicon) comme a 512. Aucune
 * courbe, aucun detail fin : c'est ce qui survit a la reduction.
 *
 * `currentColor` partout : le logo suit l'encre du theme, il n'a pas besoin
 * d'une version claire et d'une version sombre.
 */
export function LogoMonogramme({
  className = "",
  withFrame = true,
}: {
  className?: string;
  withFrame?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="BLF Lab's"
    >
      {withFrame && (
        <rect
          x="4"
          y="4"
          width="132"
          height="132"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        />
      )}

      {/* B */}
      <g transform="translate(18 50)">
        <rect x="0" y="0" width="8" height="40" />
        <rect x="0" y="0" width="30" height="8" />
        <rect x="0" y="16" width="26" height="8" />
        <rect x="0" y="32" width="30" height="8" />
        <rect x="22" y="8" width="8" height="8" />
        <rect x="22" y="24" width="8" height="8" />
      </g>

      {/* L */}
      <g transform="translate(58 50)">
        <rect x="0" y="0" width="8" height="40" />
        <rect x="0" y="32" width="24" height="8" />
      </g>

      {/* F */}
      <g transform="translate(90 50)">
        <rect x="0" y="0" width="8" height="40" />
        <rect x="0" y="0" width="28" height="8" />
        <rect x="0" y="16" width="22" height="8" />
      </g>

      {/* Apostrophe de "Lab's", reprise comme signe du studio. */}
      <rect x="112" y="34" width="8" height="14" />
    </svg>
  );
}
