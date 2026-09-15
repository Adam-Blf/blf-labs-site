import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import {
  IconAppsMobiles,
  IconAppsWeb,
  IconDataIa,
  IconSitesWeb,
} from "@/components/icons/OffreIcons";
import { Reveal } from "@/components/motion/Reveal";
import { OFFRES, type OffreSlug } from "@/content/offres";

/**
 * Services, en grille de quatre cartes a cadre net.
 *
 * Le quart de disque flou qui ornait l'angle de chaque carte a ete retire : un
 * degrade violet passe au flou est precisement le decor que themes.css refuse,
 * et c'etait le seul flou du site. Le survol ne grossit plus la carte non plus
 * (un agrandissement de 2 % sur un bloc de texte le rend flou pendant
 * l'animation) : le cadre se renforce et la fleche avance, ce qui designe la
 * carte sans la deformer.
 */
const ICONS: Record<OffreSlug, (props: { className?: string }) => React.ReactNode> = {
  "sites-web": IconSitesWeb,
  "apps-web": IconAppsWeb,
  "apps-mobiles": IconAppsMobiles,
  "data-ia": IconDataIa,
};

export function OffreGrid() {
  return (
    <section id="offre" className="relative">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
          Des services conçus pour{" "}
          <span className="grad-text">votre activité</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg font-light text-muted">
          Quatre familles de projets. Si le votre tient dans plusieurs cases, ou
          dans aucune, c&rsquo;est une conversation, pas un problème.
        </p>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-2">
          {OFFRES.map((offre) => {
            const Icon = ICONS[offre.slug];

            return (
              <Link
                key={offre.slug}
                href={`/offre/${offre.slug}`}
                className="glass group relative overflow-hidden p-8 hover:border-line-strong sm:p-10"
              >
                <div className="relative z-10">
                  <span className="glass-sm inline-flex h-14 w-14 items-center justify-center">
                    <Icon className="h-7 w-7 text-ink" />
                  </span>

                  <h3 className="title mt-8 text-2xl sm:text-3xl">
                    {offre.title}
                  </h3>

                  <p className="mt-4 font-light leading-relaxed text-muted">
                    {offre.pitch}
                  </p>

                  <ul className="mt-8 flex flex-wrap gap-2">
                    {offre.stack.map((tool) => (
                      <li
                        key={tool}
                        className="rounded-[var(--radius-sm)] border border-line px-3 py-1 text-xs font-medium text-muted"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>

                  <span className="mono mt-8 inline-flex items-center gap-2 text-xs text-muted transition-colors group-hover:text-ink">
                    En savoir plus
                    <ArrowRightIcon
                      aria-hidden="true"
                      weight="bold"
                      className="h-3.5 w-3.5 transition-transform duration-200 ease-snap group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
