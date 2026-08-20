"use client";

import Link from "next/link";
import type { Pole } from "./navigation";

/**
 * Les onglets d'un pole, portes par l'URL.
 *
 * Des LIENS et non des boutons : un onglet est une adresse. Cela lui donne
 * gratuitement le clic-milieu, l'ouverture dans un nouvel onglet du navigateur,
 * le favori et le bouton precedent - quatre comportements qu'un `onClick` sur
 * un `button` devrait reimplementer, et qu'il reimplemente toujours mal.
 *
 * Le soulignement au citron marque l'onglet actif, comme la navigation
 * principale : c'est la meme grammaire visuelle a deux niveaux, et non deux
 * facons differentes de dire « vous etes ici ».
 */
export function Onglets({ pole, actif }: { pole: Pole; actif: string }) {
  if (pole.onglets.length === 0) return null;

  return (
    <nav
      aria-label={`Sections de ${pole.libelle.toLowerCase()}`}
      className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
    >
      {pole.onglets.map((onglet) => {
        const estActif = onglet.cle === actif;
        return (
          <Link
            key={onglet.cle}
            href={`${pole.chemin}?onglet=${onglet.cle}`}
            aria-current={estActif ? "page" : undefined}
            className={`relative py-1 transition-colors ${
              estActif ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {onglet.libelle}
            {estActif && (
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-support"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
