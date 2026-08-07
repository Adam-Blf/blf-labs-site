import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/marketing/Hero";
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

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <Link
                href="/services"
                className="glass group p-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="mono text-xs text-muted">01</p>
                <h3 className="title mt-4 text-2xl">Les services</h3>
                <p className="mt-3 font-light text-muted">
                  {OFFRES.length} familles de projets, de la vitrine a
                  l&rsquo;outil metier.
                </p>
              </Link>

              <Link
                href="/methode"
                className="glass group p-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="mono text-xs text-muted">02</p>
                <h3 className="title mt-4 text-2xl">La methode</h3>
                <p className="mt-3 font-light text-muted">
                  Comment un projet se deroule, du cadrage a la remise des cles.
                </p>
              </Link>

              <Link
                href="/references"
                className="glass group p-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="mono text-xs text-muted">03</p>
                <h3 className="title mt-4 text-2xl">Les realisations</h3>
                <p className="mt-3 font-light text-muted">
                  Des projets livres, en ligne, que vous pouvez consulter.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
