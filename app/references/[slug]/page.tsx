import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ETUDES, ETUDE_PAR_SLUG } from "@/content/etudes";
import { REFERENCES } from "@/content/references";

/**
 * Etude de cas, une par realisation.
 *
 * Pourquoi une page par projet plutot qu'un paragraphe de plus sur
 * `/references` : c'est le contenu que lit quelqu'un qui hesite, et il le lit
 * longtemps. Une carte de trois lignes ne convainc personne de confier un
 * budget ; le detail du raisonnement, si. C'est aussi le seul contenu du site
 * qui peut se classer sur des recherches de probleme plutot que de prestation.
 *
 * La fiche courte (`content/references.ts`) et l'etude (`content/etudes.ts`)
 * restent deux fichiers separes et lies par le slug : la carte doit pouvoir
 * exister sans etude, le temps qu'elle soit ecrite.
 */
export function generateStaticParams() {
  return ETUDES.map((etude) => ({ slug: etude.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reference = REFERENCES.find((item) => item.slug === slug);
  const etude = ETUDE_PAR_SLUG.get(slug);

  if (!reference || !etude) return {};

  return {
    title: `${reference.title}, étude de cas`,
    description: etude.contexte.slice(0, 155),
    alternates: { canonical: `/references/${slug}` },
  };
}

export default async function EtudePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reference = REFERENCES.find((item) => item.slug === slug);
  const etude = ETUDE_PAR_SLUG.get(slug);

  if (!reference || !etude) notFound();

  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb
              miettes={[
                { nom: "Réalisations", href: "/references" },
                { nom: reference.title },
              ]}
            />

            <h1 className="title mt-8 text-4xl md:text-6xl">
              {reference.title}
            </h1>
            <p className="mono mt-4 text-sm text-muted">{reference.role}</p>

            <p className="mt-8 text-lg leading-relaxed text-muted">
              {etude.contexte}
            </p>

            <div className="relative mt-12 aspect-[16/10] overflow-hidden border border-line">
              <Image
                src={reference.shot}
                alt={`Capture du site ${reference.title}`}
                fill
                sizes="(min-width: 768px) 56rem, 100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">Le problème</h2>
            <div className="mt-8 space-y-6">
              {etude.probleme.map((paragraphe) => (
                <p
                  key={paragraphe.slice(0, 40)}
                  className="text-lg leading-relaxed text-muted"
                >
                  {paragraphe}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">Ce qu&rsquo;on a fait</h2>
            <ol className="mt-12 space-y-10">
              {etude.reponse.map((bloc, index) => (
                <li key={bloc.titre} className="border-t border-line pt-8">
                  <p className="mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="title mt-4 text-2xl">{bloc.titre}</h3>
                  <p className="mt-4 leading-relaxed text-muted">
                    {bloc.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Ce qui est <span className="grad-text">vérifiable</span>
            </h2>
            <p className="mt-6 text-muted">
              Chaque point ci-dessous se contrôle en ouvrant le site livré.
            </p>

            <ul className="mt-10 space-y-4">
              {etude.verifiable.map((point) => (
                <li key={point} className="flex gap-4 leading-relaxed text-ink">
                  <span aria-hidden="true" className="text-accent">
                    &rarr;
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            {/* Le bloc de chiffres n'existe que s'il y a des mesures reelles.
                Une etude de cas sans chiffre est honnete ; une etude de cas
                avec des chiffres inventes ne l'est pas. */}
            {etude.chiffres.length > 0 && (
              <dl className="mt-14 grid gap-6 sm:grid-cols-3">
                {etude.chiffres.map((chiffre) => (
                  <div key={chiffre.libelle} className="blk p-6">
                    <dt className="text-sm text-muted">{chiffre.libelle}</dt>
                    <dd className="tabular title mt-2 text-3xl">
                      {chiffre.valeur}
                    </dd>
                    <p className="mt-3 text-xs text-faint">{chiffre.source}</p>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-14 flex flex-wrap gap-4">
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
              >
                Voir le site en ligne
              </a>
              <Link
                href="/references"
                className="btn-pill border border-line-strong px-8 py-4 font-medium text-ink"
              >
                Les autres réalisations
              </Link>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
