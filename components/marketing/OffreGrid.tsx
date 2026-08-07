import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OFFRES } from "@/content/offres";

export function OffreGrid() {
  return (
    <section id="offre" className="rule-b">
      <div className="section mx-auto max-w-6xl px-5">
        <h2 className="title text-3xl md:text-5xl">Ce qu&rsquo;on fabrique</h2>
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
                {/* Le numero tient lieu de pictogramme : un chiffre reste net a
                    toute taille et evite le clipart generique. */}
                <span className="tabular mono text-sm font-bold text-support">
                  {offre.index}
                </span>

                <h3 className="title mt-4 text-2xl group-hover:underline md:text-3xl">
                  {offre.title}
                </h3>

                <p className="mt-3 text-muted">{offre.pitch}</p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {offre.stack.map((tool) => (
                    <li
                      key={tool}
                      className="blk-flat mono px-2 py-1 text-xs"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>

                <span className="mono mt-6 text-sm font-bold uppercase">
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
