import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Hero } from "@/components/marketing/Hero";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";
import { Avis } from "@/components/marketing/Avis";
import { ZoneCouverte } from "@/components/marketing/ZoneCouverte";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/motion/Reveal";
import { LigneStrip } from "@/components/ui/LigneStrip";
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

const CORRESPONDANCES = [
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
];

/**
 * Accueil.
 *
 * Le site est volontairement multi-pages : l'accueil ne rejoue pas l'integralite
 * du contenu en une seule colonne a faire defiler. Il pose la promesse, puis
 * oriente vers les pages dediees (services, methode, realisations, commande),
 * chacune ayant sa propre adresse, son propre titre et sa propre indexation.
 *
 * L'orientation se lit comme un tableau de correspondances : trois rangees
 * reglees, une station et une destination, plutot que trois cartes identiques.
 */
export default function Home() {
  return (
    <>
      <JsonLd />
      <Header />

      <main id="contenu">
        <Hero />

        <section className="rule-t">
          <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <LigneStrip className="mb-12" />
            <h2 className="title max-w-3xl text-5xl sm:text-6xl">
              Par où <span className="grad-text">commencer</span>
            </h2>

            <Reveal className="mt-14 border-b border-line">
              {CORRESPONDANCES.map((destination) => (
                <Link
                  key={destination.href}
                  href={destination.href}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-2 border-t border-line py-8 sm:grid-cols-[auto_18rem_1fr_auto] sm:gap-x-10"
                >
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 rounded-full border-[5px] border-ink bg-surface transition-colors duration-150 group-hover:bg-accent"
                  />
                  <h3 className="title text-3xl sm:text-4xl">{destination.title}</h3>
                  <p className="col-start-2 text-muted sm:col-start-3 sm:row-start-1">
                    {destination.body}
                  </p>
                  <ArrowRightIcon
                    aria-hidden="true"
                    weight="bold"
                    className="col-start-3 row-span-2 row-start-1 h-7 w-7 text-ink transition-transform duration-200 ease-snap group-hover:translate-x-1 sm:col-start-4 sm:row-span-1"
                  />
                </Link>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Un apercu des realisations des l'accueil : c'est ce qu'un visiteur
            veut voir en premier chez un studio, avant toute promesse. La version
            compacte n'affiche pas le detail, la page dediee s'en charge. */}
        <ReferencesSection compact />

        {/* Ne rend rien tant qu aucun avis reel n existe. */}
        <Avis />

        <ZoneCouverte />

        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
