import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ARTICLES } from "@/content/journal";

/**
 * Index du journal.
 *
 * La route repond 404 tant qu'aucun article n'est publie. Ce n'est pas un
 * oubli : une page d'index vide indexee est du contenu mince, et Google fait
 * deborder cette penalisation sur le reste du domaine. Mieux vaut que la page
 * n'existe pas que d'exister vide.
 *
 * Elle s'active toute seule au premier article, sans rien rebrancher : le
 * sitemap et le pied de page lisent la meme source.
 */
export const metadata: Metadata = {
  title: "Journal",
  description:
    "Ce qu'on apprend en livrant des projets : décisions techniques, pièges rencontrés, et ce qui change vraiment pour un client.",
  alternates: { canonical: "/journal" },
};

export default function JournalPage() {
  if (ARTICLES.length === 0) notFound();

  const tries = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Header />

      <main id="contenu">
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Journal" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Le <span className="grad-text">journal</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Ce qu&rsquo;on apprend en livrant des projets. Des décisions
              techniques expliquées, des pièges rencontrés, et ce que ça change
              concrètement pour un client.
            </p>

            <ul className="mt-16 space-y-10">
              {tries.map((article) => (
                <li key={article.slug} className="border-t border-line pt-8">
                  <p className="mono text-xs text-muted">
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>{" "}
                    - {article.lecture} min
                  </p>
                  <h2 className="title mt-4 text-2xl sm:text-3xl">
                    <Link
                      href={`/journal/${article.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {article.titre}
                    </Link>
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted">
                    {article.resume}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
