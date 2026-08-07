"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wordmark } from "./Wordmark";

/**
 * Le site est multi-pages : chaque entree pointe vers une adresse reelle, pas
 * vers une ancre dans une page unique. Chacune a son titre, sa description et
 * son referencement propres.
 */
const NAV = [
  { href: "/services", label: "Services" },
  { href: "/methode", label: "Methode" },
  { href: "/references", label: "Realisations" },
  { href: "/questions", label: "Questions" },
];

/**
 * Barre de navigation flottante en pastille de verre.
 *
 * Le flou et l'opacite du fond augmentent avec le defilement : transparente en
 * haut de page, franchement depolie des que du contenu passe dessous. Les
 * valeurs sont interpolees sur les 50 premiers pixels.
 *
 * L'ecouteur de defilement est passif et ne fait qu'ecrire un booleen : le
 * navigateur n'est pas sollicite a chaque pixel.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 50);

      // Seuil de 6 px : sans lui, le tremblement du defilement inertiel sur
      // pave tactile ferait clignoter la barre.
      if (Math.abs(y - lastY) > 6) {
        // On ne masque jamais dans les 120 premiers pixels, sinon la barre
        // disparait des le premier geste alors qu'on est encore en haut.
        setHidden(y > lastY && y > 120);
        lastY = y;
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le menu mobile ouvert force l'affichage : le refermer par un defilement
  // laisserait un panneau ouvert sur une barre invisible.
  const isHidden = hidden && !open;

  return (
    <header
      className={`fixed inset-x-0 top-6 z-50 px-4 transition-transform duration-300 ${
        isHidden ? "-translate-y-[150%]" : "translate-y-0"
      }`}
    >
      <nav
        aria-label="Navigation principale"
        className={`mx-auto max-w-5xl border border-line transition-all duration-300 ${
          open ? "rounded-3xl" : "rounded-full"
        }`}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${scrolled ? 0.08 : 0.02})`,
          backdropFilter: `blur(${scrolled ? 24 : 8}px)`,
          WebkitBackdropFilter: `blur(${scrolled ? 24 : 8}px)`,
        }}
      >
        <div className="flex items-center justify-between gap-6 px-5 py-3">
          <Link href="/" className="shrink-0">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-link text-sm font-medium text-muted-strong transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/commander"
              className="btn-pill hidden bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink sm:block"
            >
              Demarrer un projet
            </Link>

            <button
              type="button"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <ul className="flex flex-col gap-1 border-t border-line px-5 py-4 md:hidden">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-medium text-muted-strong"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/commander"
                onClick={() => setOpen(false)}
                className="btn-pill mt-2 block bg-accent px-5 py-3 text-center text-sm font-semibold text-accent-ink"
              >
                Demarrer un projet
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
