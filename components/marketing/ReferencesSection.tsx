import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import Link from "next/link";
import { ETUDE_PAR_SLUG } from "@/content/etudes";
import { REFERENCES } from "@/content/references";

/**
 * Realisations, en grille portfolio.
 *
 * Refonte du 2026-08-07. Le diagnostic etait sans appel : la page ne montrait
 * rien, seulement du texte. Pour un studio, c'est le pire defaut possible - on
 * demande a un client de juger un travail qu'il ne voit pas.
 *
 * Chaque realisation porte donc maintenant une capture du site reel, prise en
 * ligne puis convertie en WebP. La vignette s'agrandit legerement au survol et
 * son voile s'estompe : le mouvement sert a designer, pas a decorer.
 */
export function ReferencesSection({
  compact = false,
  niveau = 2,
}: {
  compact?: boolean;
  /**
   * Niveau du titre. La section est montee sur l'accueil, ou le Hero porte
   * deja le <h1>, et sur sa page dediee, ou elle est le sujet de la page.
   * Sans ce reglage, la page dediee n'avait aucun <h1> : naviguer par titres,
   * le geste le plus courant au lecteur d'ecran, n'y donnait aucun point
   * d'entree.
   */
  niveau?: 1 | 2;
}) {
  const Titre = niveau === 1 ? "h1" : "h2";
  return (
    <section id="réalisations" className="relative">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Titre className="title max-w-2xl text-4xl sm:text-5xl lg:text-6xl">
            Déjà <span className="grad-text">en ligne</span>
          </Titre>
          <p className="max-w-sm font-light text-muted">
            Des projets livrés et consultables, pas des maquettes.
          </p>
        </div>

        <Reveal className="mt-16 grid gap-8 lg:grid-cols-2">
          {REFERENCES.map((reference, index) => (
            <article key={reference.slug} className="group">
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
                  <Image
                    src={reference.shot}
                    alt={`Capture du site ${reference.title}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    /* La premiere vignette est visible d'emblee sur la page
                       dediee : la charger en priorite evite un trou pendant le
                       rendu. Les suivantes restent en chargement differe. */
                    priority={index === 0}
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Voile qui s'estompe au survol : la capture s'eclaircit
                      quand on la designe. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/30 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-40"
                  />
                </div>

                <div className="mt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h3 className="title text-2xl sm:text-3xl">
                      {reference.title}
                    </h3>
                    <span className="text-sm text-muted-strong transition-transform duration-300 group-hover:translate-x-1">
                      Voir le site &rarr;
                    </span>
                  </div>

                  <p className="mono mt-3 text-[0.7rem] text-muted">
                    {reference.role}
                  </p>

                  <p className="mt-4 font-light leading-relaxed text-muted">
                    {reference.summary}
                  </p>
                </div>
              </a>

              {/* Lien vers l'etude de cas, quand elle existe. Sans lui, la page
                  la plus detaillee du site n'aurait aucun lien entrant : ni un
                  visiteur ni un moteur ne la trouveraient. */}
              {ETUDE_PAR_SLUG.has(reference.slug) && (
                <Link
                  href={`/references/${reference.slug}`}
                  className="nav-link mt-6 inline-block text-sm font-medium text-muted-strong transition-colors hover:text-ink"
                >
                  Lire l&rsquo;étude de cas
                </Link>
              )}

              {!compact && (
                <ul className="mt-6 space-y-3">
                  {reference.facts.map((fact) => (
                    <li
                      key={fact}
                      className="flex gap-3 text-sm font-light text-muted-strong"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
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
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
