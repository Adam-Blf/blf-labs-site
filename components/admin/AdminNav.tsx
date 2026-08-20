"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigation du back-office. L'onglet actif est marque par un soulignement au
 * citron (la couleur de tension de la DA), pas par un aplat : on lit d'un coup
 * ou l'on se trouve sans que la barre ressemble a une rangee de boutons.
 */
const NAV = [
  { href: "/admin", label: "Accueil" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/facturation", label: "Facturation" },
  { href: "/admin/comptabilite", label: "Comptabilité" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? path === "/admin"
            : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {item.label}
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
