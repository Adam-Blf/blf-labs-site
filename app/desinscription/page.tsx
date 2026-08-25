import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE } from "@/lib/site";
import { litJeton } from "@/lib/prospection/jeton";
import { retireDeLaListe } from "./action";

/**
 * La page de retrait de la liste.
 *
 * Elle demande une confirmation au lieu de desinscrire a l'ouverture, et c'est
 * volontaire : plusieurs messageries visitent les liens d'un message avant que
 * la personne clique, pour verifier qu'ils repondent. Une desinscription
 * declenchee par un simple GET retirerait alors des gens qui n'ont rien
 * demande, et personne ne saurait pourquoi la liste fond.
 *
 * Le bouton, lui, poste. C'est le meme geste que le bouton natif de la
 * messagerie, qui appelle /api/desinscription en POST sans afficher cette page.
 *
 * `noindex` : une page de retrait n'a rien a faire dans un moteur de recherche.
 */
export const metadata: Metadata = {
  title: "Ne plus recevoir ces messages",
  description: "Retirer votre adresse de la liste de diffusion de BLF Lab's.",
  robots: { index: false, follow: false },
};

export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ jeton?: string; fait?: string }>;
}) {
  const { jeton, fait } = await searchParams;
  const email = litJeton("desinscription", jeton);
  const termine = fait === "1";

  return (
    <>
      <Header />

      <main className="flex flex-1 items-center">
        <div className="section mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          {termine ? (
            <>
              <p className="mono text-sm text-muted">Retrait enregistré</p>
              <h1 className="title mt-6 text-4xl sm:text-5xl">
                C&rsquo;est <span className="grad-text">fait</span>
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-muted">
                Votre adresse a été retirée de la liste, immédiatement et
                définitivement. Vous ne recevrez plus de message commercial de
                notre part, et cette adresse ne peut plus y être réinscrite par
                un formulaire.
              </p>
              <p className="mt-6 leading-relaxed text-muted">
                Si vous aviez une demande de devis en cours, elle suit son cours
                normalement : écrivez à{" "}
                <a className="underline" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>{" "}
                pour la reprendre.
              </p>
            </>
          ) : email ? (
            <>
              <p className="mono text-sm text-muted">Liste de diffusion</p>
              <h1 className="title mt-6 text-4xl sm:text-5xl">
                Ne plus rien recevoir
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-muted">
                Un clic et l&rsquo;adresse <strong className="text-ink">{email}</strong>{" "}
                est retirée de la liste. Pas de question, pas de formulaire de
                motif, pas de compte à créer.
              </p>

              <form action={retireDeLaListe} className="mt-10">
                <input type="hidden" name="jeton" value={jeton ?? ""} />
                <button
                  type="submit"
                  className="blk bg-accent px-6 py-3 font-semibold text-accent-ink"
                >
                  Retirer mon adresse
                </button>
              </form>

              <p className="mt-8 text-sm leading-relaxed text-muted">
                Vous préférez seulement espacer les envois ? Répondez à
                n&rsquo;importe quel message, la réponse arrive dans une vraie
                boîte.
              </p>
            </>
          ) : (
            <>
              <p className="mono text-sm text-muted">Lien non reconnu</p>
              <h1 className="title mt-6 text-4xl sm:text-5xl">
                Ce lien n&rsquo;est plus lisible
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-muted">
                Le lien a probablement été coupé par votre messagerie en le
                recopiant. Écrivez simplement à{" "}
                <a className="underline" href={`mailto:${SITE.email}?subject=Désinscription`}>
                  {SITE.email}
                </a>{" "}
                avec le mot « désinscription », le retrait est fait le jour même.
              </p>
              <p className="mt-8">
                <Link className="underline" href="/">
                  Revenir à l&rsquo;accueil
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
