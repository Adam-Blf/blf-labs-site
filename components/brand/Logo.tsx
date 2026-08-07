/**
 * Logo BLF Lab's.
 *
 * Bloc typographique : "BLF" est DECOUPE dans un pave plein, et "LAB'S" est pose
 * dessous - avec la fiole du laboratoire A LA PLACE DU A. Une fiole d'Erlenmeyer
 * a deja la silhouette d'un A, et son niveau de liquide en tient lieu de barre :
 * l'embleme se lit donc comme une lettre, pas comme un pictogramme colle a cote
 * du nom.
 *
 * Deux contraintes techniques qui expliquent la forme du code :
 *
 * 1. La decoupe passe par `fill-rule="evenodd"` sur un tracé unique, pas par un
 *    `<mask>` ni un `<clipPath>` : ceux-ci exigent un identifiant, et le logo est
 *    rendu plusieurs fois par page (en-tete, favicon, pied, planche) ce qui
 *    produirait des identifiants dupliques. Corollaire : les rectangles des
 *    lettres ne doivent JAMAIS se chevaucher, sinon les zones communes
 *    redeviennent pleines.
 *
 * 2. Aucune lettre n'est du `<text>` : un texte SVG dependrait de la police
 *    installee et se casserait a l'export en favicon ou en image de partage.
 *    Tout est en geometrie, sur une grille reguliere.
 */
export function Logo({
  className = "",
  withWord = true,
}: {
  className?: string;
  /** Faux = pave "BLF" seul, pour les tres petites tailles (favicon 16 px). */
  withWord?: boolean;
}) {
  return (
    <svg
      viewBox={withWord ? "0 0 200 150" : "0 0 200 92"}
      className={className}
      role="img"
      aria-label="BLF Lab's"
    >
      {/* Pave arrondi, avec B, L et F evides dedans. */}
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="
          M12 0H188A12 12 0 0 1 200 12V80A12 12 0 0 1 188 92H12A12 12 0 0 1 0 80V12A12 12 0 0 1 12 0Z
          M44 24H53V68H44Z
          M53 24H77V33H53Z
          M53 42H73V51H53Z
          M53 59H77V68H53Z
          M68 33H77V42H68Z
          M68 51H77V59H68Z
          M88 24H97V68H88Z
          M97 59H114V68H97Z
          M125 24H134V68H125Z
          M134 24H156V33H134Z
          M134 42H149V51H134Z
        "
      />

      {withWord && (
        <g>
          {/* L */}
          <path fill="currentColor" d="M48 108H54V138H48ZM54 132H64V138H54Z" />

          {/* A remplace par la fiole : col, puis corps triangulaire evide. */}
          <path
            fillRule="evenodd"
            fill="currentColor"
            d="
              M80 108H86V113H80Z
              M83 111L94 138H72Z
              M83 122L88.5 133H77.5Z
            "
          />
          {/* Niveau de liquide : il fait la barre du A. Couleur d'appui, seul
              element colore du logo. */}
          <path fill="var(--support)" d="M76.5 128H89.5L91.6 133H74.4Z" />

          {/* B */}
          <path
            fill="currentColor"
            d="M102 108H108V138H102ZM108 108H120V114H108ZM108 120H118V126H108ZM108 132H120V138H108ZM114 114H120V120H114ZM114 126H120V132H114Z"
          />

          {/* Apostrophe */}
          <path fill="var(--support)" d="M124 108H130V121H124Z" />

          {/* S */}
          <path
            fill="currentColor"
            d="M134 108H152V114H134ZM134 114H140V120H134ZM134 120H152V126H134ZM146 126H152V132H146ZM134 132H152V138H134Z"
          />
        </g>
      )}
    </svg>
  );
}
