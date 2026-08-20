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

// Le pied de page porte TOUTES les entrees, y compris celles qui ne tiennent
// pas dans la barre du haut : c'est lui qui garantit qu'aucune page n'est
// orpheline, donc atteignable ni par un visiteur ni par un moteur. On les range
// par intention : les pages du studio d'un cote, les actions de l'autre, plutot
// qu'une seule colonne fourre-tout.
const STUDIO = [
  { href: "/services", label: "Services" },
  { href: "/tarifs", label: "Budgets et délais" },
  { href: "/methode", label: "Méthode" },
  { href: "/references", label: "Réalisations" },
  { href: "/a-propos", label: "À propos" },
  { href: "/questions", label: "Questions" },
  { href: "/studio-ou-agence", label: "Studio ou agence" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/developpement-web-ile-de-france", label: "Île-de-France" },
];

const ACTIONS = [
  { href: "/commander", label: "Démarrer un projet" },
  { href: "/rendez-vous", label: "Prendre rendez-vous" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/legal/mentions", label: "Mentions légales" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/cgv", label: "Conditions générales de vente" },
  { href: "/legal/cookies", label: "Gestion des traceurs" },
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
          <Link href="/" aria-label="BLF Lab's - retour à l'accueil" className="inline-block">
            <Wordmark />
          </Link>
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
          {STUDIO.map((item) => (
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
          <p className="mt-1 text-sm text-muted">Île-de-France</p>

          <ul className="mt-6 space-y-2">
            {ACTIONS.map((item) => (
              <Lien key={item.href} href={item.href}>
                {item.label}
              </Lien>
            ))}
          </ul>
        </div>
      </div>

      {/*
        Barre d'identification legale : denomination et SIRET a gauche (LCEN,
        atteignables depuis n'importe quelle page), liens legaux a droite. Dense
        et en petits caracteres, presente sans dominer le pied de page.
      */}
      <div className="rule-t px-5 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="tabular">
            {SITE.legalMention} - SIRET {SIRET_PRETTY} - {SITE.vat}
          </p>
          <nav
            aria-label="Informations légales"
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            {LEGAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
