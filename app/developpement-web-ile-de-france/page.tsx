import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { OFFRES } from "@/content/offres";

/**
 * Page de zone d'intervention.
 *
 * Le levier d'acquisition organique le plus rentable pour un prestataire
 * local : les recherches geolocalisees ont une intention d'achat que les
 * recherches generiques n'ont pas. Quelqu'un qui cherche "developpeur web
 * Val-de-Marne" veut prestataire, pas un tutoriel.
 *
 * ATTENTION AU PIEGE. Ce n'est PAS une invitation a fabriquer une grappe de
 * pages ville - Vitry, Creteil, Ivry, Villejuif - quasi identiques. Ces pages
 * satellites se cannibalisent entre elles et sont traitees comme du spam. Une
 * seule page de zone, avec du contenu reel sur la facon de travailler en
 * Ile-de-France, vaut mieux que quinze pages vides.
 *
 * Aucune adresse postale n'est publiee : l'adresse enregistree est un
 * domicile. Le referencement local fonctionne par `areaServed` dans les
 * donnees structurees, deja en place.
 */
export const metadata: Metadata = {
  title: "Développement web en Île-de-France",
  description:
    "Studio de développement basé en Île-de-France : sites, applications web et mobiles, outils data. Présentiel dans toute la région, réponse sous 48 heures ouvrées.",
  alternates: { canonical: "/developpement-web-ile-de-france" },
};

export default function ZonePage() {
  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Île-de-France" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Développement web en{" "}
              <span className="grad-text">Île-de-France</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Le studio est basé dans le Val-de-Marne et intervient dans toute
              l&rsquo;Île-de-France. Concrètement : le cadrage et les points
              d&rsquo;étape peuvent se tenir chez vous, dans vos locaux, sans
              que cela alourdisse le devis d&rsquo;une ligne de déplacement.
            </p>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Ailleurs en France, tout se fait à distance et la méthode ne
              change pas. La différence n&rsquo;est pas dans la qualité du
              travail, elle est dans la facilité à se voir quand un projet
              patine, ce qui arrive à tous les projets.
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Pourquoi la proximité change quelque chose
            </h2>

            <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted">
              <p>
                Pas pour écrire le code : celui-ci s&rsquo;écrit aussi bien à
                trois kilomètres qu&rsquo;à trois cents. La proximité compte à
                deux moments précis.
              </p>
              <p>
                <strong className="text-ink">Au cadrage.</strong> Une heure
                autour d&rsquo;une table remplace trois visioconférences et deux
                allers-retours d&rsquo;emails. C&rsquo;est là que se décide si
                le projet est bien posé, et un projet mal cadré coûte plus cher
                que n&rsquo;importe quel déplacement.
              </p>
              <p>
                <strong className="text-ink">Quand ça coince.</strong> Un
                blocage se règle plus vite en regardant le même écran. Sur un
                projet à distance, le même blocage prend une semaine de
                messages.
              </p>
            </div>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Ce qui se construit ici
            </h2>

            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {OFFRES.map((offre) => (
                <li key={offre.slug} className="blk flex flex-col gap-4 p-8">
                  <h3 className="title text-2xl">{offre.title}</h3>
                  <p className="leading-relaxed text-muted">{offre.pitch}</p>
                  <Link
                    href={`/offre/${offre.slug}`}
                    className="nav-link mt-auto inline-block font-medium text-muted-strong transition-colors hover:text-ink"
                  >
                    Voir le détail
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-12 max-w-2xl leading-relaxed text-muted">
              Le studio ne reçoit pas dans ses locaux et ne publie pas
              d&rsquo;adresse : les rendez-vous se tiennent chez vous ou en
              visioconférence. Les informations légales complètes figurent dans
              les{" "}
              <Link
                href="/legal/mentions"
                className="text-ink underline underline-offset-4"
              >
                mentions légales
              </Link>
              .
            </p>
          </div>
        </section>

        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
