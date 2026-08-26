import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SITE } from "@/lib/site";

/**
 * Prise de rendez-vous, marche basse du tunnel.
 *
 * Le site n'avait qu'un seul appel a l'action, et il supposait un projet deja
 * cadre : remplir un formulaire en trois etapes demande de savoir ce qu'on
 * veut, son budget et son echeance. Quelqu'un qui en est encore a se demander
 * si son idee tient la route n'y allait pas, et repartait.
 *
 * Pas d'outil de reservation en ligne, volontairement. Un agenda connecte
 * imposerait un service tiers, ses cookies et son consentement, pour un
 * volume de rendez-vous qu'un echange d'emails absorbe sans effort. Le jour ou
 * le volume le justifie, cette page devient le point d'accroche naturel.
 */
export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description:
    "Vingt minutes pour dire si votre idée tient, ce qu'elle coûterait à peu près, et si le studio est le bon interlocuteur. Sans engagement.",
  alternates: { canonical: "/rendez-vous" },
};

const ETAPES = [
  {
    titre: "Vous écrivez trois lignes",
    texte:
      "Ce que vous voulez faire, pour qui, et quand. Trois lignes suffisent : le reste se dit de vive voix, et écrire un cahier des charges avant de savoir si le projet est faisable est du travail perdu.",
  },
  {
    titre: "On se cale sous 48 heures ouvrées",
    texte:
      "Une réponse avec deux ou trois créneaux, en visioconférence. Écran partagé, et un document écrit qui vous reste à la fin.",
  },
  {
    titre: "Vingt minutes, pas une heure",
    texte:
      "Assez pour dire si l'idée tient, donner un ordre de grandeur de budget et de délai, et vous orienter ailleurs si ce n'est pas pour nous. Une heure de démonstration commerciale n'apprend rien à personne.",
  },
];

export default function RendezVousPage() {
  return (
    <>
      <Header />

      <main id="contenu">
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Prendre rendez-vous" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Vingt minutes pour <span className="grad-text">y voir clair</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Vous n&rsquo;êtes pas obligé d&rsquo;arriver avec un projet
              cadré. Si vous hésitez encore sur le principe, sur le budget ou
              sur la faisabilité, un échange court répond mieux
              qu&rsquo;un formulaire.
            </p>

            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent(
                "Prendre rendez-vous",
              )}`}
              className="btn-pill mt-10 inline-flex min-h-[56px] items-center bg-accent px-8 text-lg font-bold text-accent-ink"
            >
              Demander un créneau
            </a>

            <p className="mt-6 text-sm text-muted">
              Gratuit et sans engagement. Si vous ne donnez pas suite, vous
              recevez au plus trois messages de suivi sur votre demande, puis
              plus rien.
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">Comment ça se passe</h2>

            <ol className="mt-12 space-y-10">
              {ETAPES.map((etape, index) => (
                <li key={etape.titre} className="border-t border-line pt-8">
                  <p className="mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="title mt-4 text-2xl">{etape.titre}</h3>
                  <p className="mt-4 leading-relaxed text-muted">
                    {etape.texte}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-14 max-w-2xl leading-relaxed text-muted">
              Si votre projet est déjà cadré, le{" "}
              <Link
                href="/commander"
                className="text-ink underline underline-offset-4"
              >
                formulaire de commande
              </Link>{" "}
              ira plus vite : il pose les bonnes questions dans le bon ordre et
              évite trois allers-retours.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
