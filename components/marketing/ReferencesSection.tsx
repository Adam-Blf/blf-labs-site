import { REFERENCES } from "@/content/references";

/**
 * Realisations.
 *
 * Reecrit apres audit : deux cartes de meme taille cote a cote formaient encore
 * une grille reguliere. Ici la premiere reference occupe la largeur pleine et la
 * seconde est decalee, ce qui casse la symetrie sans desordre.
 */
export function ReferencesSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rule-b">
      <div className="section mx-auto max-w-6xl px-5">
        <div className="flex items-baseline gap-6">
          <span className="marginalia text-sm">03</span>
          <h2 className="title text-3xl md:text-5xl">Deja livre</h2>
        </div>

        <div className="mt-16 space-y-16">
          {REFERENCES.map((reference, index) => (
              /* Une reference sur deux est decalee vers la droite : la
                 composition respire au lieu de s'aligner au cordeau. */
              <article
                key={reference.slug}
                className={`rule-t pt-10 ${index % 2 === 1 ? "lg:ml-[16rem]" : ""}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
                  <h3 className="title text-3xl md:text-5xl">
                    {reference.title}
                  </h3>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono border-b border-current pb-1 text-xs uppercase transition-colors hover:text-accent"
                  >
                    Voir en ligne
                  </a>
                </div>

                <p className="mono mt-4 text-xs uppercase text-accent">
                  {reference.role}
                </p>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                  {reference.summary}
                </p>

                {!compact && (
                  <ul className="mt-8 max-w-2xl space-y-3">
                    {reference.facts.map((fact) => (
                      <li key={fact} className="flex gap-4 leading-relaxed">
                        {/* Puce dessinee : la regle typographique interdit les
                            cadratins. */}
                        <span
                          aria-hidden="true"
                          className="mt-[11px] block h-px w-5 shrink-0 bg-accent"
                        />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                  {reference.tags.map((tag) => (
                    <li key={tag} className="mono text-xs text-muted">
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
          ))}
        </div>
      </div>
    </section>
  );
}
