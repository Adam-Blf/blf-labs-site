import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { RESSOURCES } from "@/content/ressources";

/**
 * Ressources a emporter.
 *
 * 404 tant qu'aucune ressource n'existe : une page vide indexee est du contenu
 * mince, et la penalisation deborde sur le reste du domaine.
 *
 * Telechargement libre, sans mur d'email : echanger un document contre une
 * adresse est un traitement de donnees personnelles complet, avec sa base
 * legale et sa duree de conservation, pour un gain marginal a ce volume.
 */
export const metadata: Metadata = {
  title: "Ressources",
  description:
    "Des documents utilisables sans le studio : modèles, listes de vérification, comparatifs. En téléchargement libre, sans formulaire.",
  alternates: { canonical: "/ressources" },
};

export default function RessourcesPage() {
  if (RESSOURCES.length === 0) notFound();

  return (
    <>
      <Header />

      <main>
        <section className="rule-b">
          <div className="section mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb miettes={[{ nom: "Ressources" }]} />

            <h1 className="title mt-8 text-4xl sm:text-6xl">
              À <span className="grad-text">emporter</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
              Des documents utilisables sans le studio. Pas de formulaire, pas
              d&rsquo;adresse email à laisser : le lien télécharge directement.
            </p>

            <ul className="mt-16 space-y-8">
              {RESSOURCES.map((ressource) => (
                <li
                  key={ressource.slug}
                  className="blk flex flex-col gap-4 p-8"
                >
                  <h2 className="title text-2xl">{ressource.titre}</h2>
                  <p className="leading-relaxed text-muted">
                    {ressource.utilite}
                  </p>
                  <a
                    href={ressource.fichier}
                    download
                    className="nav-link mt-auto inline-block font-medium text-muted-strong transition-colors hover:text-ink"
                  >
                    Télécharger, {ressource.format}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
