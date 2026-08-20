"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { POLES, poleCourant } from "./navigation";

/**
 * Navigation du back-office. L'onglet actif est marque par un soulignement au
 * citron (la couleur de tension de la DA), pas par un aplat : on lit d'un coup
 * ou l'on se trouve sans que la barre ressemble a une rangee de boutons.
 */
/*
 * La liste vit dans `navigation.ts`, avec les onglets de chaque pole : une
 * navigation ecrite a deux endroits finit par diverger, et c'est le menu qui a
 * raison a l'ecran pendant que l'autre a raison dans le code.
 */

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
      {POLES.map((item) => {
        const active = poleCourant(path ?? "")?.chemin === item.chemin;
        return (
          <Link
            key={item.chemin}
            href={item.chemin}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {item.libelle}
            {active && (
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
