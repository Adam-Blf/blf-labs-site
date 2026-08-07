import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/#offre", label: "Offre" },
  { href: "/references", label: "References" },
  { href: "/#methode", label: "Methode" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-line bg-paper">
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
                  className="font-mono text-sm uppercase tracking-wide underline-offset-8 hover:underline"
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
