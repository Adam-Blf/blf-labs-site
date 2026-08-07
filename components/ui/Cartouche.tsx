/**
 * Cartouche d'identification.
 *
 * C'est l'etiquette collee sur un flacon de paillasse : une reference courte a
 * gauche, un intitule a droite, un filet qui les separe. Elle sert a annoncer
 * une section sans recourir a une numerotation - Adam a refuse les sections
 * numerotees, et une reference d'echantillon remplit le meme role de reperage
 * sans imposer un ordre de lecture.
 *
 * La reference n'est pas decorative : elle reprend le vocabulaire du studio
 * (ESS pour essai, REF pour reference, PROT pour protocole) et reste stable
 * d'une page a l'autre, ce qui donne au site sa coherence de carnet de labo.
 */
export function Cartouche({
  reference,
  children,
  className = "",
}: {
  /** Code court affiche a gauche du filet, par exemple "REF-04". */
  reference: string;
  /** Intitule lisible de la section. */
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="mono bg-accent px-2 py-1 text-[0.7rem] text-accent-ink tabular">
        {reference}
      </span>
      {/* Filet de liaison, purement graphique. */}
      <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
      <span className="mono text-[0.7rem] text-muted">{children}</span>
    </div>
  );
}
