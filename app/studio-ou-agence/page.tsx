import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";

/**
 * Freelance, studio ou agence : comparatif honnete.
 *
 * C'est la question la plus posee avant d'acheter, et le contenu le plus
 * cite par les moteurs generatifs, parce qu'il repond a une intention de
 * comparaison plutot qu'a une intention de marque.
 *
 * REGLE DE REDACTION : le comparatif doit etre utilisable par quelqu'un qui
 * finira par choisir une agence. Un tableau ou la colonne "nous" gagne sur
 * toutes les lignes n'est pas un comparatif, c'est une publicite, et il se
 * repere en trois secondes. Les cas ou il faut aller voir ailleurs sont donc
 * ecrits en premier et sans reserve.
 */
export const metadata: Metadata = {
  title: "Freelance, studio ou agence : comment choisir",
  description:
    "Les vraies différences entre un freelance, un studio d'une personne et une agence, et dans quels cas chacun est le bon choix pour votre projet.",
  alternates: { canonical: "/studio-ou-agence" },
};

const CRITERES = [
  {
    critere: "Interlocuteur",
    freelance: "La personne qui code",
    studio: "La personne qui code",
    agence: "Un chef de projet, rarement celui qui code",
  },
  {
    critere: "Projets en parallèle",
    freelance: "Souvent plusieurs, pour lisser les creux",
    studio: "Peu, et annoncés",
    agence: "Beaucoup, avec une équipe dimensionnée pour",
  },
  {
    critere: "Si la personne s'arrête",
    freelance: "Le projet s'arrête",
    studio: "Le projet s'arrête, mais le code et les accès sont chez vous",
    agence: "Quelqu'un reprend",
  },
  {
    critere: "Prix",
    freelance: "Le plus bas",
    studio: "Intermédiaire",
    agence: "Le plus élevé, structure comprise",
  },
  {
    critere: "Périmètre confortable",
    freelance: "Une mission cadrée",
    studio: "Un projet entier, de bout en bout",
    agence: "Plusieurs chantiers simultanés, ou un très gros",
  },
];

export default function StudioOuAgencePage() {
  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Freelance, studio ou agence" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Freelance, studio ou <span className="grad-text">agence</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Trois façons d&rsquo;acheter le même livrable, avec des
              conséquences très différentes. Ce comparatif est écrit par un
              studio d&rsquo;une personne, donc lisez-le en sachant d&rsquo;où
              il parle. Il commence volontairement par les cas où il faut aller
              voir ailleurs.
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Quand il faut une <span className="grad-text">agence</span>
            </h2>

            <ul className="mt-10 space-y-6 text-lg leading-relaxed text-muted">
              <li>
                <strong className="text-ink">
                  Quand la continuité prime sur tout.
                </strong>{" "}
                Un outil dont l&rsquo;arrêt coûte de l&rsquo;argent chaque heure
                a besoin de plusieurs personnes capables d&rsquo;intervenir. Un
                studio d&rsquo;une personne ne peut pas promettre ça, quoi
                qu&rsquo;il en dise.
              </li>
              <li>
                <strong className="text-ink">
                  Quand plusieurs chantiers avancent en même temps.
                </strong>{" "}
                Refonte, application mobile et campagne simultanées demandent
                des personnes en parallèle, pas une personne en série.
              </li>
              <li>
                <strong className="text-ink">
                  Quand votre organisation l&rsquo;exige.
                </strong>{" "}
                Certains appels d&rsquo;offres et certaines directions achats
                imposent un effectif minimum ou des certifications. C&rsquo;est
                une contrainte réelle, pas un prétexte.
              </li>
            </ul>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">Les différences</h2>

            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line-strong">
                    <th className="mono py-4 pr-4 text-xs font-normal text-muted">
                      Critère
                    </th>
                    <th className="mono py-4 pr-4 text-xs font-normal text-muted">
                      Freelance
                    </th>
                    <th className="mono py-4 pr-4 text-xs font-normal text-ink">
                      Studio
                    </th>
                    <th className="mono py-4 text-xs font-normal text-muted">
                      Agence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERES.map((ligne) => (
                    <tr key={ligne.critere} className="border-b border-line">
                      <th
                        scope="row"
                        className="py-5 pr-4 align-top font-semibold text-ink"
                      >
                        {ligne.critere}
                      </th>
                      <td className="py-5 pr-4 align-top text-muted">
                        {ligne.freelance}
                      </td>
                      <td className="py-5 pr-4 align-top text-ink">
                        {ligne.studio}
                      </td>
                      <td className="py-5 align-top text-muted">
                        {ligne.agence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-10 max-w-2xl leading-relaxed text-muted">
              La ligne qui compte le plus est la troisième. Chez un prestataire
              d&rsquo;une personne, la seule protection réelle est que le code,
              le nom de domaine et les accès soient à votre nom dès le premier
              jour. C&rsquo;est vérifiable, contrairement à une promesse de
              disponibilité.
            </p>

            <div className="mt-14 flex flex-wrap gap-4">
              <Link
                href="/a-propos"
                className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
              >
                Comment ce studio travaille
              </Link>
              <Link
                href="/tarifs"
                className="btn-pill border border-line-strong px-8 py-4 font-medium text-ink"
              >
                Budgets et délais
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
