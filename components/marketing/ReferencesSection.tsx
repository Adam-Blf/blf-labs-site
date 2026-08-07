import { Card } from "@/components/ui/Card";
import { REFERENCES } from "@/content/references";

export function ReferencesSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className="border-b-[3px] border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">
          Realisations
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Des projets en ligne, consultables. Pas de captures d&rsquo;ecran de
          maquettes jamais livrees.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {REFERENCES.map((reference) => (
            <Card key={reference.slug} className="p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
                  {reference.title}
                </h3>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm underline underline-offset-4"
                >
                  Voir le site
                </a>
              </div>

              <p className="mt-2 font-mono text-xs uppercase tracking-wide text-support">
                {reference.role}
              </p>

              <p className="mt-4 text-muted">{reference.summary}</p>

              {!compact && (
                <ul className="mt-5 space-y-2">
                  {reference.facts.map((fact) => (
                    <li key={fact} className="flex gap-3 text-sm">
                      {/* Puce dessinee, pas un caractere tiret : la regle
                          typographique interdit les cadratins, et un carre
                          plein colle mieux au neobrutalisme. */}
                      <span
                        aria-hidden="true"
                        className="mt-[7px] block h-2 w-2 shrink-0 bg-support"
                      />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              )}

              <ul className="mt-6 flex flex-wrap gap-2">
                {reference.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border-2 border-line px-2 py-1 font-mono text-xs"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
