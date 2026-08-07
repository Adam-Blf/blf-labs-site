import { REFERENCES } from "@/content/references";

/**
 * Realisations, en cartes de verre.
 *
 * La specification d'origine prevoyait une galerie dont les vignettes
 * s'agrandissent au survol. Elle reposait sur des captures des projets, qui
 * n'existent pas encore ici : la carte s'eleve donc au survol, et l'effet
 * d'agrandissement sera rebranche quand les captures seront disponibles.
 */
export function ReferencesSection({ compact = false }: { compact?: boolean }) {
  return (
    <section id="realisations" className="relative">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="title max-w-2xl text-4xl sm:text-5xl lg:text-6xl">
            Deja <span className="grad-text">en ligne</span>
          </h2>
          <p className="max-w-sm font-light text-muted">
            Des projets livres et consultables, pas des maquettes.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {REFERENCES.map((reference) => (
            <article
              key={reference.slug}
              className="glass group relative overflow-hidden p-8 transition-transform duration-500 hover:-translate-y-2 sm:p-10"
            >
              <span
                aria-hidden="true"
                className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-[#f5a524]/15 to-[#ff6b4a]/15 blur-3xl"
              />

              <div className="relative z-10">
                <p className="mono text-xs text-muted">{reference.role}</p>

                <h3 className="title mt-4 text-3xl sm:text-4xl">
                  {reference.title}
                </h3>

                <p className="mt-5 font-light leading-relaxed text-muted">
                  {reference.summary}
                </p>

                {!compact && (
                  <ul className="mt-8 space-y-3">
                    {reference.facts.map((fact) => (
                      <li
                        key={fact}
                        className="flex gap-3 text-sm font-light text-muted-strong"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a524]"
                        />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <ul className="flex flex-wrap gap-2">
                    {reference.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill glass-sm px-5 py-2.5 text-sm font-medium"
                  >
                    Voir le site
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
