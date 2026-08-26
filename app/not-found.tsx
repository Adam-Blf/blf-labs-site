import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OFFRES } from "@/content/offres";

/**
 * Page 404.
 *
 * Sans ce fichier, Next rend sa page par defaut : un texte noir sur blanc,
 * sans en-tete, sans pied de page, sans un seul lien. Un visiteur qui suit un
 * lien perime depuis Google ou un ancien devis y arrive et n'a nulle part ou
 * aller, alors qu'il cherchait quelque chose de precis sur ce site.
 *
 * Elle est donc traitee comme une page du site et non comme un message
 * d'erreur : meme en-tete, meme pied de page, et surtout des issues reelles.
 * L'offre est reprise depuis `content/offres.ts` plutot que recopiee ici : une
 * cinquieme offre ajoutee demain apparaitra sur cette page sans que personne
 * ait a y penser.
 *
 * `noindex` mais `follow` : Google ne doit pas indexer une page d'erreur, mais
 * il doit continuer a suivre les liens qu'elle porte, sinon elle devient un
 * cul-de-sac pour l'exploration du site.
 */
export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "Cette adresse ne correspond à aucune page du site. Voici par où reprendre.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />

      <main id="contenu" className="flex flex-1 items-center">
        <div className="section mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="mono text-sm text-muted">Erreur 404</p>

          <h1 className="title mt-6 text-4xl sm:text-6xl">
            Cette page n&rsquo;existe <span className="grad-text">pas</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            L&rsquo;adresse est peut-être mal recopiée, ou la page a changé de
            nom depuis le lien que vous avez suivi. Rien n&rsquo;est perdu :
            tout le site tient en quelques pages.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
            >
              Retour à l&rsquo;accueil
            </Link>
            <Link
              href="/commander"
              className="btn-pill border border-line-strong px-8 py-4 font-medium text-ink"
            >
              Décrire un projet
            </Link>
          </div>

          <div className="mt-16 border-t border-line pt-10">
            <p className="mono text-xs text-muted">Les services</p>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {OFFRES.map((offre) => (
                <li key={offre.slug}>
                  <Link
                    href={`/offre/${offre.slug}`}
                    className="nav-link text-base font-medium text-muted-strong transition-colors hover:text-ink"
                  >
                    {offre.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
