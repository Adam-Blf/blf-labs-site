/**
 * Piste 2 : bloc typographique.
 *
 * "BLF" est DECOUPE dans un pave plein, et non peint couleur papier : c'est le
 * fond reel qui transparait, quel qu'il soit. Une premiere version peignait les
 * lettres en couleur papier et le logo disparaissait des qu'il etait pose sur un
 * aplat colore (blanc sur blanc), defaut constate en capture.
 *
 * La decoupe se fait par `fill-rule="evenodd"` sur un tracé unique plutot que
 * par un `<mask>` : un masque exige un identifiant, et le logo est rendu
 * plusieurs fois sur la meme page (grand, 32 px, 16 px, sur aplat), ce qui
 * produirait des identifiants dupliques.
 *
 * Consequence a respecter si on retouche les lettres : les rectangles ne doivent
 * JAMAIS se chevaucher, sinon les zones communes redeviennent pleines.
 */
export function LogoBloc({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-label="BLF Lab's"
    >
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="
          M0 0H200V92H0Z
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

      {/* "LAB'S" pose SOUS le pave, en encre courante : lisible sur n'importe
          quel fond, contrairement a une reserve. */}
      <text
        x="44"
        y="132"
        fill="currentColor"
        fontFamily="var(--font-mono), monospace"
        fontSize="24"
        letterSpacing="6"
      >
        LAB
      </text>

      {/* Apostrophe : seul element colore, c'est la signature de la marque. */}
      <rect x="110" y="112" width="7" height="15" fill="var(--support)" />

      <text
        x="123"
        y="132"
        fill="currentColor"
        fontFamily="var(--font-mono), monospace"
        fontSize="24"
        letterSpacing="6"
      >
        S
      </text>
    </svg>
  );
}
