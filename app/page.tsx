import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Hero } from "@/components/marketing/Hero";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/motion/Reveal";
import { OFFRES } from "@/content/offres";

/**
 * L'accueil etait la seule page sans metadonnees propres : elle heritait mot
 * pour mot du titre et de la description de la racine.
 *
 * Ce n'est pas neutre. Le titre par defaut sert de repli a toute page qui n'en
 * declare pas, donc il doit rester generique, alors que l'accueil a besoin
 * d'etre precis : c'est lui qui se classe sur le nom du studio et sur son
 * metier. Le titre est ecrit en entier plutot que passe par le gabarit
 * `%s - BLF Lab's`, qui aurait donne "BLF Lab's - BLF Lab's".
 */
export const metadata: Metadata = {
  title: {
    absolute:
      "BLF Lab's - développement de sites et d'applications en Île-de-France",
  },
  description:
    "Studio indépendant : sites, applications web et mobiles, outils data et IA. Un seul interlocuteur du cadrage à la mise en ligne. Réponse sous 48 heures ouvrées.",
  alternates: { canonical: "/" },
};

/**
 * Accueil.
 *
 * Le site est volontairement multi-pages : l'accueil ne rejoue pas l'integralite
 * du contenu en une seule colonne a faire defiler. Il pose la promesse, puis
 * oriente vers les pages dediees (services, methode, realisations, commande),
 * chacune ayant sa propre adresse, son propre titre et sa propre indexation.
 */
export default function Home() {
  return (
    <>
      <JsonLd />
      <Header />

      <main>
        <Hero />

        <section className="relative">
          <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="title max-w-3xl text-4xl sm:text-5xl">
              Par où <span className="grad-text">commencer</span>
            </h2>

            {/* Aucune numerotation : les sections se distinguent par leur
                titre et leur contenu, pas par un compteur. */}
            <Reveal className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  href: "/services",
                  title: "Les services",
                  body: `${OFFRES.length} familles de projets, de la vitrine à l'outil métier.`,
                },
                {
                  href: "/methode",
                  title: "La méthode",
                  body: "Comment un projet se déroule, du cadrage à la remise des clés.",
                },
                {
                  href: "/references",
                  title: "Les réalisations",
                  body: "Des projets livrés, en ligne, que vous pouvez consulter.",
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="glass group flex flex-col justify-between gap-10 p-8 transition-transform duration-300 hover:-translate-y-1"
                >
                  <h3 className="title text-2xl">{card.title}</h3>

                  <div>
                    <p className="font-light text-muted">{card.body}</p>
                    <span
                      aria-hidden="true"
                      className="mt-6 inline-block text-xl text-muted-strong transition-transform duration-300 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Un apercu des realisations des l'accueil : c'est ce qu'un visiteur
            veut voir en premier chez un studio, avant toute promesse. La version
            compacte n'affiche pas le detail, la page dediee s'en charge. */}
        <ReferencesSection compact />

        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
