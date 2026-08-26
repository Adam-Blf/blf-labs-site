import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { Tarifs } from "@/components/marketing/Tarifs";

/**
 * Budgets et delais.
 *
 * Pourquoi cette page existe alors que les montants ne sont pas encore
 * publies : le prix est le premier filtre du visiteur, et son absence totale
 * fait fuir ceux qui ont le budget autant qu'elle attire ceux qui ne l'ont
 * pas. A defaut de chiffres, expliquer COMMENT un prix se construit repond
 * deja a la moitie de la question, et c'est verifiable aujourd'hui.
 *
 * Le tableau des fourchettes ne s'affiche que quand `content/tarifs.ts` est
 * rempli. Aucun montant n'est invente : un chiffre affiche engage
 * l'entreprise, et le premier devis qui le contredit detruit la confiance au
 * moment exact ou elle compte.
 */
export const metadata: Metadata = {
  title: "Budgets et délais",
  description:
    "Comment se construit le prix d'un projet chez BLF Lab's : ce qui le fait varier, ce qui est inclus, et comment obtenir un devis ferme.",
  alternates: { canonical: "/tarifs" },
};

const FACTEURS = [
  {
    titre: "Le nombre d'écrans, pas le nombre de pages",
    texte:
      "Un site de douze pages qui répètent la même mise en page coûte moins qu'un site de quatre écrans tous différents. C'est le nombre de gabarits distincts qui compte, pas le sommaire.",
  },
  {
    titre: "Qui écrit le contenu",
    texte:
      "Des textes et des images fournis raccourcissent le projet. Des contenus à produire, à collecter ou à attendre l'allongent, et c'est le premier poste de dérive de délai.",
  },
  {
    titre: "Ce qui doit se connecter à l'existant",
    texte:
      "Un site autonome est simple. Un site qui doit dialoguer avec un outil de facturation, un agenda ou un logiciel métier dépend de la qualité de leur interface, qui n'est jamais garantie à l'avance.",
  },
  {
    titre: "Le niveau d'exigence sur la donnée",
    texte:
      "Un formulaire de contact et un tunnel de paiement avec relances ne sont pas le même travail. Les obligations de conformité, de traçabilité et de reprise sur panne se paient en temps, pas en licences.",
  },
];

export default function TarifsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Budgets et délais" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Ce qui fait le <span className="grad-text">prix</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Chaque projet est devisé, et le devis est ferme : il fixe le prix,
              le périmètre et le calendrier avant que la première ligne soit
              écrite. Pas de facture surprise à la fin, pas de régularisation
              après coup.
            </p>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Ce que cette page explique, c&rsquo;est ce qui fait varier ce
              devis, pour que vous puissiez estimer de quel côté vous êtes avant
              même de le demander.
            </p>
          </div>
        </section>

        <Tarifs />

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Les quatre choses qui font varier un devis
            </h2>

            <ol className="mt-12 space-y-10">
              {FACTEURS.map((facteur, index) => (
                <li key={facteur.titre} className="border-t border-line pt-8">
                  <p className="mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="title mt-4 text-2xl">{facteur.titre}</h3>
                  <p className="mt-4 leading-relaxed text-muted">
                    {facteur.texte}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">Ce qui est inclus</h2>
            <ul className="mt-10 space-y-4">
              {[
                "La maquette validée avant la première ligne de code.",
                "Le code et les accès livrés à votre nom, et cédés au paiement intégral.",
                "Les pages légales et la conformité RGPD dès la mise en ligne.",
                "Le référencement technique et les données structurées.",
                "La documentation nécessaire pour qu'un autre développeur reprenne.",
              ].map((point) => (
                <li key={point} className="flex gap-4 leading-relaxed text-ink">
                  <span aria-hidden="true" className="text-accent">
                    &rarr;
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            {/*
              L'article 3 de l'arrete du 3 decembre 1987 impose d'indiquer
              EXPLICITEMENT ce que le prix annonce ne comprend pas, des lors
              qu'il s'agit d'un element indispensable a la finalite du service.
              Un nom de domaine et un hebergement sont indispensables a un site.

              La liste ci-dessus disait « le code, le nom de domaine et les
              acces livres a votre nom », sous un titre « Ce qui est inclus »,
              alors que content/options.ts facture le nom de domaine. La phrase
              voulait dire que le domaine est mis AU NOM du client, pas qu'il
              est offert : elle se lisait comme le contraire.
            */}
            <p className="mt-8 max-w-2xl leading-relaxed text-muted">
              Le nom de domaine et l&rsquo;hébergement ne sont pas compris dans
              ce montant, alors qu&rsquo;ils sont nécessaires pour qu&rsquo;un
              site soit en ligne. Lorsque vous nous les confiez, ils sont ouverts
              à votre nom, jamais au nôtre, et vous en gardez les accès. Ils
              figurent au devis sur une ligne chiffrée à part, comme la rédaction
              des contenus, l&rsquo;identité visuelle et la maintenance.
            </p>

            <p className="mt-10 max-w-2xl leading-relaxed text-muted">
              L&rsquo;hébergement, les licences tierces et la maintenance après
              livraison font l&rsquo;objet d&rsquo;une ligne distincte au devis :
              ce sont des coûts récurrents, les mélanger au prix du projet
              reviendrait à les cacher.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/commander"
                className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
              >
                Demander un devis
              </Link>
              <Link
                href="/questions"
                className="btn-pill border border-line-strong px-8 py-4 font-medium text-ink"
              >
                Questions fréquentes
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
