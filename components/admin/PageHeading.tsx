import type { ReactNode } from "react";

/**
 * En-tete de page du back-office. Un filet sous le titre donne la meme assise a
 * toutes les pages et remplace l'empilement de titres nus : on sait toujours ou
 * l'on est, et l'action principale de la page se pose a droite du filet.
 */
export function PageHeading({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="title text-2xl">{title}</h1>
        {sub && <p className="mt-1 max-w-xl text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
