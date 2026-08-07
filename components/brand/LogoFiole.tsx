/**
 * Piste 3 : embleme de laboratoire.
 *
 * Une fiole reduite a sa geometrie : un col rectangulaire, un corps trapezoidal,
 * un niveau en aplat. Aucun degrade, aucun reflet - le piege de cette piste
 * serait justement le pictogramme brillant facon start-up, qu'on evite en
 * gardant des aretes franches et un trait de meme epaisseur que le reste du
 * site.
 */
export function LogoFiole({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={className}
      role="img"
      aria-label="BLF Lab's"
    >
      <g stroke="currentColor" strokeWidth="9" strokeLinejoin="miter" fill="none">
        {/* Col */}
        <path d="M57 14h26v30" />
        <path d="M57 14v30" />
        {/* Corps : trapeze franc, pas d'arrondi. */}
        <path d="M57 44 26 118h88L83 44" />
        {/* Trait de graduation, detail qui dit "mesure". */}
        <path d="M96 92h10" strokeWidth="7" />
      </g>

      {/* Niveau de liquide : le seul aplat, il porte la couleur d'accent. */}
      <path d="M42 88h56l12 28H30z" fill="var(--accent)" />

      {/* Bulles carrees, dans l'esprit modulaire du reste. */}
      <rect x="52" y="66" width="10" height="10" fill="currentColor" />
      <rect x="72" y="52" width="8" height="8" fill="currentColor" />
    </svg>
  );
}
