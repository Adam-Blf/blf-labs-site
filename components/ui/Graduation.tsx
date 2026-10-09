/**
 * Regle graduee.
 *
 * Bande de traits reguliers, un trait sur cinq plus long, comme la graduation
 * d'une eprouvette ou le bord d'un reglet. C'est l'element signature du site :
 * il apparait au bas du hero et en tete des grandes sections, et c'est lui qui
 * rend une capture d'ecran reconnaissable sans le logo.
 *
 * Pourquoi des `<span>` et pas un SVG : la graduation doit s'etirer sur toute
 * la largeur disponible quelle que soit la taille de l'ecran. Une grille CSS
 * repartit les traits exactement, la ou un SVG imposerait un ratio fixe et
 * ferait varier l'epaisseur des traits avec la mise a l'echelle.
 *
 * Purement decorative : `aria-hidden` sur le conteneur, aucun texte.
 */
export function Graduation({
  traits = 60,
  className = "",
}: {
  /** Nombre de traits. Un multiple de 5 garde la derniere marque haute. */
  traits?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-6 w-full items-end justify-between ${className}`}
    >
      {Array.from({ length: traits }, (_, index) => (
        <span
          key={index}
          className={
            index % 5 === 0
              ? "w-px bg-line-strong h-6"
              : "w-px bg-line h-3"
          }
        />
      ))}
    </div>
  );
}
