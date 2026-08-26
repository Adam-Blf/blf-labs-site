import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SECTEURS } from "@/content/secteurs";
import { REFERENCES } from "@/content/references";

/**
 * Page par secteur d'activite.
 *
 * `generateStaticParams` renvoie un tableau vide tant que `content/secteurs.ts`
 * l'est : aucune page n'est generee, donc aucune page creuse n'est publiee.
 * Une page secteur sans reference dans ce secteur ne se classe pas et fait
 * douter du reste du site.
 */
export function generateStaticParams() {
  return SECTEURS.map((secteur) => ({ slug: secteur.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const secteur = SECTEURS.find((item) => item.slug === slug);
  if (!secteur) return {};

  return {
    title: `Développement web pour ${secteur.nom}`,
    description: secteur.probleme,
    alternates: { canonical: `/secteurs/${slug}` },
  };
}

export default async function SecteurPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const secteur = SECTEURS.find((item) => item.slug === slug);
  if (!secteur) notFound();

  const citees = REFERENCES.filter((ref) =>
    secteur.references.includes(ref.slug),
  );

  return (
    <>
      <Header />
      <main id="contenu">
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: secteur.nom }]} />
            <h1 className="title mt-8 text-4xl sm:text-6xl">{secteur.nom}</h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              {secteur.probleme}
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">Ce qu&rsquo;on y fait</h2>
            <ul className="mt-10 space-y-4">
              {secteur.reponse.map((point) => (
                <li key={point} className="flex gap-4 leading-relaxed text-ink">
                  <span aria-hidden="true" className="text-accent">
                    &rarr;
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            {citees.length > 0 && (
              <div className="mt-14">
                <h3 className="mono text-xs text-muted">
                  Réalisations dans ce secteur
                </h3>
                <ul className="mt-6 space-y-3">
                  {citees.map((ref) => (
                    <li key={ref.slug}>
                      <Link
                        href={`/references/${ref.slug}`}
                        className="nav-link font-medium text-muted-strong transition-colors hover:text-ink"
                      >
                        {ref.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
