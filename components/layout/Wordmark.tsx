/**
 * Signature typographique provisoire.
 *
 * Elle tient lieu de logo tant que la piste de logo n'est pas choisie (jalon
 * J2). Ce composant est le seul endroit a remplacer ensuite.
 *
 * L'apostrophe est coloree : c'est le detail qui distingue "BLF Lab's" d'un
 * sigle nu, et il se retrouve dans les trois pistes de logo.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`title text-xl ${className}`}>
      BLF Lab<span className="text-support">&rsquo;</span>s
    </span>
  );
}
