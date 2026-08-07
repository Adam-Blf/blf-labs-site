import Link from "next/link";
import { SITE, SIRET_PRETTY } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const LEGAL = [
  { href: "/legal/mentions", label: "Mentions legales" },
  { href: "/legal/confidentialite", label: "Confidentialite" },
  { href: "/legal/cgv", label: "CGV" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t-[3px] border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Studio independant de developpement d&rsquo;applications, base en
            Ile-de-France.
          </p>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Contact
          </h2>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-3 inline-block font-display text-lg font-bold underline-offset-4 hover:underline"
          >
            {SITE.email}
          </a>
          <p className="mt-2 text-sm text-muted">
            {SITE.address.postalCode} {SITE.address.city}
          </p>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Informations
          </h2>
          <ul className="mt-3 space-y-1">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t-[3px] border-line px-5 py-4">
        <p className="tabular mx-auto max-w-6xl font-mono text-xs text-muted">
          {SITE.legalMention} - SIRET {SIRET_PRETTY} - APE {SITE.ape}
        </p>
      </div>
    </footer>
  );
}
