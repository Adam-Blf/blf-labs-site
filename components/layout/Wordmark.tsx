/**
 * Signature typographique provisoire.
 *
 * Elle tient lieu de logo tant qu'Adam n'a pas choisi parmi les trois pistes
 * dessinees (jalon J2). Ce composant est le seul endroit a remplacer ensuite.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-xl font-extrabold uppercase tracking-tight ${className}`}
    >
      BLF<span className="text-support"> </span>Lab
      <span className="text-support">&rsquo;</span>s
    </span>
  );
}
