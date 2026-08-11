import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SITE } from "@/lib/site";

/**
 * Page de contact.
 *
 * Elle manquait, et c'etait le trou le plus grave du site : le seul point
 * d'entree etait le tunnel de commande en trois etapes. Or tout le monde
 * n'arrive pas avec un projet cadre. Un prospect qui a une question, un
 * partenaire, un recruteur, une agence qui cherche un sous-traitant : aucun
 * n'allait remplir un formulaire de commande, et aucun n'avait autre chose
 * qu'une adresse email perdue dans le pied de page.
 *
 * Le parti pris : pas de second formulaire. Un formulaire de contact
 * generique en plus du formulaire de commande, c'est deux boites a surveiller
 * et deux fois plus de spam, pour une information moins utile. L'email direct
 * est plus rapide pour les deux parties, et il laisse une trace chez celui qui
 * ecrit.
 */
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Écrire au studio BLF Lab's : une question, un partenariat, une sous-traitance. Réponse sous 48 heures ouvrées.",
  alternates: { canonical: "/contact" },
};

const MOTIFS = [
  {
    titre: "Vous avez un projet",
    texte:
      "Le formulaire de commande est plus rapide : il pose les questions dans le bon ordre et évite trois échanges d'emails pour cadrer le besoin.",
    action: { libelle: "Décrire le projet", href: "/commander" },
  },
  {
    titre: "Vous avez une question",
    texte:
      "Prix, délais, propriété du code, maintenance : la plupart des réponses sont déjà écrites, et elles engagent quelque chose de vérifiable.",
    action: { libelle: "Voir les questions fréquentes", href: "/questions" },
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Contact" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              Écrire au <span className="grad-text">studio</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Une seule adresse, relevée tous les jours ouvrés. Vous recevez une
              réponse écrite{" "}
              <strong className="text-ink">sous 48 heures ouvrées</strong>,
              même quand c&rsquo;est pour dire non ou vous orienter ailleurs.
            </p>

            <a
              href={`mailto:${SITE.email}`}
              className="btn-pill mt-10 inline-flex min-h-[56px] items-center bg-accent px-8 text-lg font-bold text-accent-ink"
            >
              {SITE.email}
            </a>

            <p className="mt-8 max-w-2xl leading-relaxed text-muted">
              Le studio n&rsquo;a pas de bureau ouvert au public : les
              rendez-vous se tiennent chez vous, dans vos locaux, ou en
              visioconférence. L&rsquo;intervention couvre toute
              l&rsquo;Île-de-France en présentiel, et le reste de la France à
              distance.
            </p>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">
              Avant d&rsquo;écrire
            </h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Deux cas où vous irez plus vite ailleurs que par email.
            </p>

            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {MOTIFS.map((motif) => (
                <li key={motif.titre} className="blk flex flex-col gap-6 p-8">
                  <h3 className="title text-2xl">{motif.titre}</h3>
                  <p className="leading-relaxed text-muted">{motif.texte}</p>
                  <Link
                    href={motif.action.href}
                    className="nav-link mt-auto inline-block font-medium text-muted-strong transition-colors hover:text-ink"
                  >
                    {motif.action.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="title text-3xl sm:text-4xl">L&rsquo;entreprise</h2>
            <dl className="tabular mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 text-sm sm:grid-cols-3">
              <div>
                <dt className="mono text-xs text-muted">Raison sociale</dt>
                <dd className="mt-2 font-medium">{SITE.legalName}</dd>
              </div>
              <div>
                <dt className="mono text-xs text-muted">Nom commercial</dt>
                <dd className="mt-2 font-medium">{SITE.brand}</dd>
              </div>
              <div>
                <dt className="mono text-xs text-muted">Zone</dt>
                <dd className="mt-2 font-medium">Île-de-France</dd>
              </div>
            </dl>

            <p className="mt-10 text-sm text-muted">
              Les informations légales complètes, dont le SIRET et le médiateur
              de la consommation, figurent dans les{" "}
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
      </main>

      <Footer />
    </>
  );
}
