import Link from "next/link";
import {
  IconAppsMobiles,
  IconAppsWeb,
  IconDataIa,
  IconSitesWeb,
} from "@/components/icons/OffreIcons";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { OFFRES, type OffreSlug } from "@/content/offres";

/**
 * Le pictogramme est associe ici, pas dans `content/offres.ts` : le contenu
 * editorial reste du texte pur, sans dependance a un composant React, ce qui
 * permet de le reutiliser cote serveur (emails, exports) sans embarquer de JSX.
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
        <Reveal>
          <h2 className="title text-3xl md:text-5xl">Ce qu&rsquo;on fabrique</h2>
          <p className="mt-4 max-w-2xl text-muted">
            Quatre familles de projets. Si le votre tient dans plusieurs cases,
            ou dans aucune, c&rsquo;est une conversation, pas un probleme.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {OFFRES.map((offre, index) => {
            const Icon = ICONS[offre.slug];

            return (
              <Reveal key={offre.slug} delay={index * 0.06}>
                <Card className="h-full transition-transform duration-200 hover:-translate-y-1">
                  <Link
                    href={`/offre/${offre.slug}`}
                    className="group flex h-full flex-col p-7"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="h-9 w-9 text-accent" />
                      <span className="tabular mono text-sm font-bold text-muted">
                        {offre.index}
                      </span>
                    </div>

                    <h3 className="title mt-5 text-2xl group-hover:underline md:text-3xl">
                      {offre.title}
                    </h3>

                    <p className="mt-3 text-muted">{offre.pitch}</p>

                    <ul className="mt-6 flex flex-wrap gap-2">
                      {offre.stack.map((tool) => (
                        <li key={tool} className="blk-flat mono px-2 py-1 text-xs">
                          {tool}
                        </li>
                      ))}
                    </ul>

                    <span className="mono mt-auto pt-6 text-sm font-bold">
                      En savoir plus
                    </span>
                  </Link>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
