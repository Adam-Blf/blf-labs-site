import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Hero } from "@/components/marketing/Hero";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";
import { OFFRES } from "@/content/offres";

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
      <Header />

      <main>
        <Hero />

        <section className="relative">
          <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="title max-w-3xl text-4xl sm:text-5xl">
              Par ou <span className="grad-text">commencer</span>
            </h2>

            {/* Aucune numerotation : les sections se distinguent par leur
                titre et leur contenu, pas par un compteur. */}
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  href: "/services",
                  title: "Les services",
                  body: `${OFFRES.length} familles de projets, de la vitrine a l'outil metier.`,
                },
                {
                  href: "/methode",
                  title: "La methode",
                  body: "Comment un projet se deroule, du cadrage a la remise des cles.",
                },
                {
                  href: "/references",
                  title: "Les realisations",
                  body: "Des projets livres, en ligne, que vous pouvez consulter.",
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
            </div>
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
