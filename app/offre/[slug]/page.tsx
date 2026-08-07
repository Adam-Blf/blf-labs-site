import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OFFRES, OFFRE_BY_SLUG } from "@/content/offres";

// Next 16 : `params` est une promesse, il faut l'attendre avant de lire le slug.
type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return OFFRES.map((offre) => ({ slug: offre.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const offre = OFFRE_BY_SLUG.get(slug as never);

  if (!offre) return { title: "Offre introuvable" };

  return {
    title: offre.title,
    description: offre.pitch,
    alternates: { canonical: `/offre/${offre.slug}` },
  };
}

export default async function OffrePage({ params }: PageProps) {
  const { slug } = await params;
  const offre = OFFRE_BY_SLUG.get(slug as never);

  // Un slug inconnu doit rendre un vrai 404, pas une page vide : sinon des URL
  // fantaisistes finissent indexees.
  if (!offre) notFound();

  const others = OFFRES.filter((item) => item.slug !== offre.slug);

  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-5">
            <Link
              href="/#offre"
              className="mono text-sm text-muted underline-offset-4 hover:underline"
            >
              Retour a l&rsquo;offre
            </Link>

            <p className="tabular mono mt-8 text-sm font-bold text-support">
              {offre.index}
            </p>

            <h1 className="title mt-3 text-4xl md:text-6xl">{offre.title}</h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {offre.intro}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href={`/commander?offre=${offre.slug}`}>
                Commander ce type de projet
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="rule-b bg-surface">
          <div className="section mx-auto max-w-4xl px-5">
            <h2 className="title text-2xl md:text-4xl">Ce qui est livre</h2>

            <ul className="mt-8 space-y-4">
              {offre.deliverables.map((item) => (
                <li key={item} className="flex gap-4">
                  {/* Puce dessinee : la regle typographique interdit les
                      cadratins. */}
                  <span
                    aria-hidden="true"
                    className="mt-[11px] block h-px w-5 shrink-0 bg-accent"
                  />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <Card className="p-6">
                <h3 className="mono text-xs uppercase tracking-widest text-muted">
                  Delai indicatif
                </h3>
                <p className="mt-3 leading-relaxed">{offre.timeline}</p>
              </Card>

              <Card className="p-6">
                <h3 className="mono text-xs uppercase tracking-widest text-muted">
                  Outils utilises
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {offre.stack.map((tool) => (
                    <li key={tool} className="blk-flat mono px-2 py-1 text-xs">
                      {tool}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-5">
            <h2 className="title text-2xl md:text-4xl">Les autres familles</h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {others.map((item) => (
                <Link
                  key={item.slug}
                  href={`/offre/${item.slug}`}
                  className="blk-sm group bg-surface p-5 transition-transform hover:-translate-y-1"
                >
                  <span className="tabular mono text-xs text-support">
                    {item.index}
                  </span>
                  <h3 className="title mt-2 text-lg group-hover:underline">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
