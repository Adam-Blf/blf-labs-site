import type { ReactNode } from "react";

/**
 * L'ecran vide, dit une bonne fois.
 *
 * UN VIDE SE DIT, IL NE SE LAISSE PAS DEVINER. Le back-office portait cinq
 * formulations differentes de la meme chose - « Aucune piece pour l'instant »,
 * « Aucune demande pour l'instant », « Aucune recette encaissee » - toutes en
 * petit gris, sans cadre et sans suite. Une page qui se contente d'une ligne
 * grise se lit comme une panne : la personne se demande si elle a mal cherche,
 * si le chargement a echoue, ou si elle n'a pas les droits.
 *
 * Une phrase qui dit ce qui manque, et quand il y en a une, l'action qui sort
 * de cet etat.
 */
export function Vide({
  titre,
  aide,
  action,
}: {
  titre: string;
  aide?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-line bg-surface/40 px-6 py-10 text-center">
      <p className="title text-base">{titre}</p>
      {aide && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          {aide}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
