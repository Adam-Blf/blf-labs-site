import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";

/**
 * Maintenance et suivi apres livraison.
 *
 * Deux raisons d'exister, l'une commerciale, l'autre honnete.
 *
 * Commerciale : rien sur le site ne vendait l'apres-livraison, alors que c'est
 * le revenu recurrent d'un studio et l'objection la plus frequente avant de
 * signer - "et apres, qui s'en occupe ?".
 *
 * Honnete : un site livre sans suivi se degrade tout seul. Les dependances
 * accumulent des failles, les navigateurs changent, les services tiers
 * modifient leurs interfaces. Ne pas le dire au moment de la vente, c'est
 * laisser le client decouvrir la facture dans dix-huit mois.
 */
export const metadata: Metadata = {
  title: "Maintenance et suivi",
  description:
    "Ce qui se passe après la mise en ligne : mises à jour de sécurité, corrections, évolutions. Ce qui est inclus et ce qui ne l'est pas.",
  alternates: { canonical: "/maintenance" },
};

const NIVEAUX = [
  {
    titre: "Rien du tout",
    texte:
      "C'est un choix valable, et il est gratuit. Vous détenez le code, le domaine et les accès : n'importe quel développeur peut reprendre. À condition d'accepter qu'un site sans mise à jour accumule des failles connues, et qu'une reprise en urgence coûte plus cher qu'un suivi.",
  },
  {
    titre: "Correctif de garantie",
    texte:
      "Toute non-conformité au devis signalée après la livraison est corrigée sans supplément, sans limite de durée. Ce n'est pas de la maintenance : c'est le travail commandé, terminé correctement.",
  },
  {
    titre: "Suivi de sécurité",
    texte:
      "Mises à jour des dépendances, surveillance des avis de sécurité, correction des failles avant qu'elles soient exploitées. C'est le poste que personne ne voit tant qu'il fonctionne, et le seul dont l'absence se paie d'un coup.",
  },
  {
    titre: "Évolutions",
    texte:
      "Ajouter une page, une fonctionnalité, une intégration. Devisé au cas par cas comme un projet, parce que c'en est un. Un forfait mensuel qui inclurait des évolutions non définies serait soit trop cher pour vous, soit intenable pour le studio.",
  },
];

export default function MaintenancePage() {
  return (
    <>
      <Header />

      <main id="contenu">
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Maintenance et suivi" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Ce qui se passe <span className="grad-text">après</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Un site n&rsquo;est pas un objet fini. Ses dépendances accumulent
              des failles connues, les navigateurs changent, les services tiers
              modifient leurs interfaces sans prévenir. Un site livré et jamais
              retouché fonctionne encore dans un an, et devient un risque dans
              trois.
            </p>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Cette page dit ce qui est inclus, ce qui ne l&rsquo;est pas, et ce
              que coûte le fait de ne rien faire. Le suivi n&rsquo;est jamais
              imposé : vous détenez le code et les accès, donc vous pouvez
              partir ailleurs à tout moment.
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">Quatre niveaux</h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Du plus léger au plus engageant. Les deux premiers ne coûtent
              rien.
            </p>

            <ol className="mt-12 space-y-10">
              {NIVEAUX.map((niveau, index) => (
                <li key={niveau.titre} className="border-t border-line pt-8">
                  <p className="mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="title mt-4 text-2xl">{niveau.titre}</h3>
                  <p className="mt-4 leading-relaxed text-muted">
                    {niveau.texte}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Ce qu&rsquo;un contrat de maintenance ne fera jamais
            </h2>
            <ul className="mt-10 space-y-4">
              {[
                "Vous enfermer : le code et les accès restent à votre nom, un préavis suffit.",
                "Facturer des heures non consommées sans le dire.",
                "Inclure des évolutions non définies dans un forfait mensuel.",
                "Vous rendre dépendant d'une brique propriétaire du studio.",
              ].map((point) => (
                <li key={point} className="flex gap-4 leading-relaxed text-ink">
                  <span aria-hidden="true" className="text-accent">
                    &rarr;
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-14 flex flex-wrap gap-4">
              <Link
                href="/commander"
                className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
              >
                Parler d&rsquo;un suivi
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
