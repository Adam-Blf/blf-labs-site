import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/#offre", label: "Offre" },
  { href: "/references", label: "References" },
  { href: "/#methode", label: "Methode" },
];

/**
 * `sticky` est desactive dans le comparateur de directions : deux barres
 * collees en haut de page se superposeraient.
 */
export function Header({ sticky = true }: { sticky?: boolean }) {
  return (
    <header
      className={`${sticky ? "sticky top-0 z-50" : ""} rule-b bg-paper`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mono text-sm uppercase tracking-wide underline-offset-8 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ButtonLink href="/commander" className="text-sm">
            Commander
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
