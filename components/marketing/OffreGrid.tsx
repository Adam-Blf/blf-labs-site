import Link from "next/link";
import {
  IconAppsMobiles,
  IconAppsWeb,
  IconDataIa,
  IconSitesWeb,
} from "@/components/icons/OffreIcons";
import { Reveal } from "@/components/motion/Reveal";
import { OFFRES, type OffreSlug } from "@/content/offres";

/**
 * Services, en grille de quatre cartes de verre.
 *
 * Le pictogramme est pose dans un quart de disque flou, en angle de carte,
 * conformement a la specification. Le halo est purement decoratif, donc masque
 * aux lecteurs d'ecran.
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
          <span className="grad-text">votre activite</span>
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
                className="glass group relative overflow-hidden p-8 transition-transform duration-300 hover:scale-[1.02] sm:p-10"
              >
                {/* Quart de disque colore, dans l'angle de la carte. */}
                <span
                  aria-hidden="true"
                  className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-orange/25 to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-80"
                />

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
                        className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>

                  <span className="mono mt-8 inline-block text-xs text-muted transition-colors group-hover:text-ink">
                    En savoir plus
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
