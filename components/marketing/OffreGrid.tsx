import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OFFRES } from "@/content/offres";

export function OffreGrid() {
  return (
    <section id="offre" className="border-b-[3px] border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">
          Ce qu&rsquo;on fabrique
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Quatre familles de projets. Si le votre tient dans plusieurs cases, ou
          dans aucune, c&rsquo;est une conversation, pas un probleme.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {OFFRES.map((offre) => (
            <Card key={offre.slug} className="flex flex-col">
              <Link
                href={`/offre/${offre.slug}`}
                className="group flex h-full flex-col p-7"
              >
                {/* Le numero tient lieu de pictogramme : un chiffre dessine dans
                    la police d'affichage reste net a toute taille et evite le
                    clipart generique. */}
                <span className="tabular font-mono text-sm font-bold text-support">
                  {offre.index}
                </span>

                <h3 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight group-hover:underline md:text-3xl">
                  {offre.title}
                </h3>

                <p className="mt-3 text-muted">{offre.pitch}</p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {offre.stack.map((tool) => (
                    <li
                      key={tool}
                      className="border-2 border-line px-2 py-1 font-mono text-xs"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>

                <span className="mt-6 font-mono text-sm font-bold uppercase">
                  En savoir plus
                </span>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
