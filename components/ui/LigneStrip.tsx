import { Fragment } from "react";

/**
 * Bande de ligne.
 *
 * Les quatre couleurs de ligne mises bout a bout, separees par une station.
 * C'est le separateur signature du site : en tete des grandes sections et du
 * pied de page, il rappelle que les quatre familles d'offre forment un seul
 * reseau.
 *
 * Les pastilles prennent la couleur du texte courant (`border-current`) et
 * restent transparentes : aucune ligne ne passe dessous, donc elles se posent
 * aussi bien sur le fond que sur un placard, sans variante.
 *
 * Purement decorative : `aria-hidden` sur le conteneur, aucun texte.
 */
const SEGMENTS = [
  "bg-ligne-sites rounded-l-full",
  "bg-ligne-web",
  "bg-ligne-mobile",
  "bg-ligne-data rounded-r-full",
];

export function LigneStrip({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-1 ${className}`}>
      {SEGMENTS.map((segment, index) => (
        <Fragment key={segment}>
          {index > 0 && (
            <span className="h-4 w-4 shrink-0 rounded-full border-[4px] border-current" />
          )}
          <span className={`h-[6px] flex-1 ${segment}`} />
        </Fragment>
      ))}
    </div>
  );
}
