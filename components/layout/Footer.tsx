import Link from "next/link";
import { SITE, SIRET_PRETTY } from "@/lib/site";
import { OFFRES } from "@/content/offres";
import { Graduation } from "@/components/ui/Graduation";
import { Wordmark } from "./Wordmark";

/**
 * Pied de page.
 *
 * Il porte trois charges distinctes, et c'est ce qui explique sa structure :
 *
 * 1. NAVIGATION. Un visiteur arrive en bas de page parce qu'il cherche
 *    quelque chose qu'il n'a pas trouve plus haut. Les quatre offres sont donc
 *    listees nommement plutot que renvoyees vers une page "Services", ce qui
 *    lui evite un saut de plus.
 *
 * 2. OBLIGATION LEGALE. La LCEN impose que l'editeur soit identifiable. La
 *    barre basse porte la denomination, le SIRET et le code d'activite, et la
 *    mention de franchise de TVA exigee par l'article 293 B du CGI figure sur
 *    la meme ligne : ces informations doivent etre atteignables depuis
 *    n'importe quelle page, pas seulement depuis les mentions legales.
 *
 * 3. IDENTITE. La regle graduee reprise du hero ferme la page comme elle
 *    l'ouvre. C'est le seul ornement, et il vient de la direction artistique
 *    plutot que d'un decor ajoute.
 *
 * Les listes sont construites depuis `content/` : une offre ajoutee apparait
 * ici sans intervention, et ne peut donc pas etre oubliee.
 */

const NAVIGATION = [
  { href: "/services", label: "Services" },
  { href: "/methode", label: "Méthode" },
  { href: "/references", label: "Réalisations" },
  { href: "/questions", label: "Questions" },
  { href: "/commander", label: "Démarrer un projet" },
];

const LEGAL = [
  { href: "/legal/mentions", label: "Mentions légales" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/cgv", label: "Conditions générales de vente" },
];

function Colonne({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mono text-[0.7rem] text-faint">{titre}</h2>
      <ul className="mt-4 space-y-2">{children}</ul>
    </div>
  );
}

function Lien({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        {children}
      </Link>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="rule-t mt-auto bg-surface">
      <div className="mx-auto max-w-6xl px-5">
        <Graduation className="opacity-60" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Studio indépendant de développement d&rsquo;applications, basé en
            Île-de-France. Le code, le nom de domaine et les accès sont livrés à
            votre nom.
          </p>
        </div>

        <Colonne titre="Savoir-faire">
          {OFFRES.map((offre) => (
            <Lien key={offre.slug} href={`/offre/${offre.slug}`}>
              {offre.title}
            </Lien>
          ))}
        </Colonne>

        <Colonne titre="Le studio">
          {NAVIGATION.map((item) => (
            <Lien key={item.href} href={item.href}>
              {item.label}
            </Lien>
          ))}
        </Colonne>

        <div>
          <h2 className="mono text-[0.7rem] text-faint">Contact</h2>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            {SITE.email}
          </a>
          <p className="mt-2 text-sm text-muted">
            {SITE.address.postalCode} {SITE.address.city}
          </p>

          <ul className="mt-6 space-y-2">
            {LEGAL.map((item) => (
              <Lien key={item.href} href={item.href}>
                {item.label}
              </Lien>
            ))}
          </ul>
        </div>
      </div>

      {/*
        Barre d'identification legale. Elle est volontairement dense et en
        petits caracteres : elle doit etre presente et lisible, sans devenir
        l'element dominant du pied de page.
      */}
      <div className="rule-t px-5 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="tabular">
            {SITE.legalMention} - SIRET {SIRET_PRETTY} - APE {SITE.ape}
          </p>
          <p>{SITE.vat}</p>
        </div>
      </div>
    </footer>
  );
}
