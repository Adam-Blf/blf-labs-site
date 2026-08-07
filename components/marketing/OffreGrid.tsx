import Link from "next/link";
import {
  IconAppsMobiles,
  IconAppsWeb,
  IconDataIa,
  IconSitesWeb,
} from "@/components/icons/OffreIcons";
import { OFFRES, type OffreSlug } from "@/content/offres";

/**
 * Les quatre familles de prestation.
 *
 * Reecrit apres audit : la version precedente etait une grille de quatre cartes
 * identiques, deux par deux, chacune avec son icone, son titre et sa phrase.
 * C'est le motif "feature cards" le plus reconnaissable du web, celui qui fait
 * qu'une page se lit comme un gabarit.
 *
 * Ici, chaque offre occupe une ligne entiere, avec son numero pose dans la
 * marge comme sur un plan technique. Les largeurs de colonnes sont volontairement
 * inegales et le trait ne separe que les lignes, jamais les colonnes : l'oeil
 * descend au lieu de balayer une grille.
 */
const ICONS: Record<OffreSlug, (props: { className?: string }) => React.ReactNode> = {
  "sites-web": IconSitesWeb,
  "apps-web": IconAppsWeb,
  "apps-mobiles": IconAppsMobiles,
  "data-ia": IconDataIa,
};

export function OffreGrid() {
  return (
    <section id="offre" className="rule-b">
      <div className="section mx-auto max-w-6xl px-5">
        <div className="flex items-baseline gap-6">
          <span className="marginalia text-sm">01</span>
          <h2 className="title text-3xl md:text-5xl">Ce qu&rsquo;on fabrique</h2>
        </div>

        <ul className="mt-16">
          {OFFRES.map((offre, index) => {
            const Icon = ICONS[offre.slug];

            return (
                <li key={offre.slug} className="rule-t">
                  <Link
                    href={`/offre/${offre.slug}`}
                    className="group grid gap-x-8 gap-y-4 py-10 md:grid-cols-[4rem_1fr] lg:grid-cols-[4rem_minmax(0,22rem)_1fr]"
                  >
                    {/* Marge : numero et pictogramme, hors du flux de lecture. */}
                    <div className="flex items-start gap-4 md:flex-col md:gap-6">
                      <span className="marginalia tabular text-sm">
                        {offre.index}
                      </span>
                      <Icon className="h-7 w-7 text-muted transition-colors group-hover:text-accent" />
                    </div>

                    <h3 className="title text-3xl md:text-4xl lg:text-[2.75rem]">
                      {offre.title}
                    </h3>

                    <div className="lg:pt-2">
                      <p className="max-w-xl text-lg leading-relaxed text-muted">
                        {offre.pitch}
                      </p>

                      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                        {offre.stack.map((tool) => (
                          <li key={tool} className="mono text-xs text-muted">
                            {tool}
                          </li>
                        ))}
                      </ul>

                      <span className="mono mt-6 inline-block border-b border-current pb-1 text-xs uppercase transition-colors group-hover:text-accent">
                        Voir le detail
                      </span>
                    </div>
                  </Link>
                </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
