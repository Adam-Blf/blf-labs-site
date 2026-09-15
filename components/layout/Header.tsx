"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Le site est multi-pages : chaque entree pointe vers une adresse reelle, pas
 * vers une ancre dans une page unique. Chacune a son titre, sa description et
 * son referencement propres.
 */
const NAV = [
  { href: "/services", label: "Services" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/methode", label: "Méthode" },
  { href: "/references", label: "Réalisations" },
  { href: "/contact", label: "Contact" },
];

/**
 * Barre de navigation flottante, un panneau plein.
 *
 * Seul son trait se renforce avec le defilement ; elle se retire quand on
 * descend et revient quand on remonte.
 *
 * L'ecouteur de defilement est passif et ne fait qu'ecrire un booleen : le
 * navigateur n'est pas sollicite a chaque pixel.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const chemin = usePathname();

  // Station courante : l'entree de la page ouverte (ou de sa section parente)
  // passe en placard plein, sans demi-mesure. Elle est aussi annoncee aux
  // lecteurs d'ecran par aria-current.
  function courant(href: string) {
    return chemin === href || Boolean(chemin?.startsWith(`${href}/`));
  }

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
      className={`fixed inset-x-0 top-4 z-50 px-4 transition-transform duration-300 ease-glide ${
        isHidden ? "-translate-y-[150%]" : "translate-y-0"
      }`}
    >
      {/*
        Barre pleine, un panneau emaille comme le reste du site. Ni verre ni
        translucidite : au-dessus d'un contenu qui glisse dessous, une barre
        translucide rend le texte illisible, et le verre refractif de la
        direction precedente est parti avec elle. Seul le trait se renforce une
        fois la page defilee. Le lien de la page courante passe en placard
        plein, comme la station ou l'on se trouve sur un plan de ligne.
      */}
      <nav
        aria-label="Navigation principale"
        className={`mx-auto max-w-5xl rounded-[var(--radius)] border bg-surface transition-colors duration-300 ${
          scrolled ? "border-line-strong" : "border-line"
        }`}
      >
        <div className="flex items-center justify-between gap-6 px-5 py-3">
          <Link href="/" className="shrink-0">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                {courant(item.href) ? (
                  <Link
                    href={item.href}
                    aria-current="page"
                    className="mono rounded-[var(--radius-sm)] bg-ink px-2.5 py-1 text-base text-paper"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className="nav-link mono text-base text-muted-strong transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/*
              La bascule de theme existait dans le depot mais n'etait rendue
              nulle part : le site suivait la preference systeme sans jamais
              laisser le visiteur en decider. Un theme sombre sans commande est
              un theme sombre a moitie livre.
            */}
            <ThemeToggle />

            <Link
              href="/commander"
              className="btn-pill title hidden bg-accent px-5 py-2.5 text-lg text-accent-ink sm:block"
            >
              Démarrer un projet
            </Link>

            <button
              type="button"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-[var(--radius)] text-ink transition-transform duration-150 ease-snap active:scale-[0.94] md:hidden"
            >
              {open ? (
                <XIcon aria-hidden="true" weight="bold" className="h-6 w-6" />
              ) : (
                <ListIcon aria-hidden="true" weight="bold" className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {open && (
          <ul
            id="menu-mobile"
            className="flex flex-col gap-1 border-t border-line px-5 py-4 md:hidden"
          >
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
                Démarrer un projet
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
