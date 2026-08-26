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
    "Studio de développement basé en Île-de-France : sites, applications web et mobiles, outils data. Travail entièrement à distance, réponse sous 48 heures ouvrées.",
  alternates: { canonical: "/developpement-web-ile-de-france" },
};

export default function ZonePage() {
  return (
    <>
      <Header />

      <main id="contenu">
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Île-de-France" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Développement web en{" "}
              <span className="grad-text">Île-de-France</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Le studio est basé dans le Val-de-Marne et travaille{" "}
              <strong className="text-ink">entièrement à distance</strong>, en
              Île-de-France comme ailleurs. Pas de déplacement, donc pas de
              ligne de déplacement dans le devis, et pas de créneau qui dépend
              du RER.
            </p>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Être en Île-de-France change deux choses réelles, et pas celle
              qu&rsquo;on croit : mêmes horaires que vous, et un interlocuteur
              qui connaît le tissu d&rsquo;entreprises d&rsquo;ici. Le reste,
              c&rsquo;est du travail, et le travail ne se déplace pas.
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Comment ça se passe, sans se voir
            </h2>

            <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted">
              <p>
                Le code s&rsquo;écrit aussi bien à trois kilomètres qu&rsquo;à
                trois cents. Ce qui compte n&rsquo;est pas la distance, c&rsquo;est
                de ne jamais avoir à deviner où en est le projet.
              </p>
              <p>
                <strong className="text-ink">Le cadrage se tient en visio</strong>
                , une à deux heures, écran partagé, et il en sort un document
                écrit que vous gardez. C&rsquo;est là que se décide si le projet
                est bien posé, et un projet mal cadré coûte plus cher que tout
                le reste.
              </p>
              <p>
                <strong className="text-ink">Vous voyez le site avancer.</strong>{" "}
                Chaque version est en ligne à une adresse que vous pouvez ouvrir
                quand vous voulez, sans attendre une réunion. Un désaccord se
                règle sur l&rsquo;écran, pas sur une description.
              </p>
              <p>
                <strong className="text-ink">Quand ça coince</strong>, on prend
                une visio dans la journée. Le blocage se règle en regardant le
                même écran, ce qui marche exactement pareil à distance.
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
              Le studio ne reçoit pas et ne se déplace pas : tous les
              rendez-vous se tiennent en visioconférence. L&rsquo;adresse
              n&rsquo;est pas publiée parce que c&rsquo;est un domicile. Les
              informations légales complètes figurent dans les{" "}
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
