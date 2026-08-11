import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SITE } from "@/lib/site";

/**
 * Qui est derriere le studio.
 *
 * Elle manquait, et c'est le premier reflexe de verification face a un studio
 * solo : qui code, avec quel parcours, et qu'est-ce qui se passe s'il tombe
 * malade. Sans cette page, le site vendait une structure anonyme, ce qui est
 * le pire des deux mondes : ni la solidite rassurante d'une agence, ni la
 * confiance qu'inspire une personne identifiee.
 *
 * Pas de page equipe, pas de faux "nous" : le studio est une personne, et le
 * dire est un avantage commercial plutot qu'un aveu. Ce qui est ecrit ici est
 * verifiable - le SIRET, la date d'immatriculation et les realisations sont
 * publics.
 */
export const metadata: Metadata = {
  title: "À propos",
  description:
    "Qui construit vos projets chez BLF Lab's, comment le studio travaille, et ce qui se passe après la livraison.",
  alternates: { canonical: "/a-propos" },
};

const PRINCIPES = [
  {
    titre: "Un seul interlocuteur",
    detail:
      "La personne qui cadre le projet est celle qui l'écrit. Rien ne se perd entre un commercial, un chef de projet et un développeur, parce qu'il n'y en a qu'un.",
  },
  {
    titre: "Le code et les accès sont à vous",
    detail:
      "Dépôt, nom de domaine, hébergement, comptes tiers : tout est ouvert à votre nom. Vous pouvez confier la suite à n'importe qui, sans rien demander. C'est la seule garantie qui vaille.",
  },
  {
    titre: "Ce qui est promis est vérifiable",
    detail:
      "Les délais annoncés sont des délais tenus ou renégociés à l'avance. Les réalisations sont en ligne et consultables. Aucun chiffre n'est affiché sur ce site sans mesure derrière.",
  },
  {
    titre: "Le refus fait partie du travail",
    detail:
      "Un projet hors budget, hors compétence ou mal cadré reçoit un non argumenté et une orientation ailleurs. C'est plus rapide pour tout le monde qu'un devis de complaisance.",
  },
];

export default function AProposPage() {
  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "À propos" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Un studio, <span className="grad-text">une personne</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              {SITE.brand} est le nom commercial sous lequel {SITE.legalName}{" "}
              conçoit et livre des sites, des applications web et mobiles, et
              des outils data et IA. Pas d&rsquo;équipe, pas de sous-traitance
              cachée : la personne qui répond à votre email est celle qui écrit
              le code.
            </p>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              C&rsquo;est une contrainte autant qu&rsquo;un choix. Un studio
              d&rsquo;une personne ne prend pas dix projets en parallèle, et il
              le dit plutôt que de faire attendre. En échange, rien ne se perd
              dans la transmission, et la décision technique se prend en
              connaissant le contexte métier.
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Ce qui ne se négocie pas
            </h2>

            <ol className="mt-12 space-y-10">
              {PRINCIPES.map((principe, index) => (
                <li key={principe.titre} className="border-t border-line pt-8">
                  <p className="mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="title mt-4 text-2xl">{principe.titre}</h3>
                  <p className="mt-4 leading-relaxed text-muted">
                    {principe.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Et si le studio s&rsquo;arrête
            </h2>
            <p className="mt-8 max-w-2xl leading-relaxed text-muted">
              C&rsquo;est la question à poser à tout prestataire d&rsquo;une
              personne, et elle a une réponse concrète ici : vous détenez déjà
              tout. Le code est chez vous, sur un dépôt à votre nom, avec son
              historique. Le nom de domaine et l&rsquo;hébergement sont à votre
              nom. Aucune brique n&rsquo;est propriétaire, aucune ne dépend
              d&rsquo;un compte du studio.
            </p>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Concrètement, n&rsquo;importe quel développeur peut reprendre le
              projet en clonant le dépôt. C&rsquo;est aussi pour cette raison
              que la documentation fait partie de la livraison et non des
              options.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/references"
                className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
              >
                Voir les réalisations
              </Link>
              <Link
                href="/methode"
                className="btn-pill border border-line-strong px-8 py-4 font-medium text-ink"
              >
                Comment se déroule un projet
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
