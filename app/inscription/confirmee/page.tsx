import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE } from "@/lib/site";

/**
 * Fin du parcours de double opt-in.
 *
 * Deux etats seulement, et l'etat d'echec dit quoi faire plutot que ce qui a
 * rate : un lien de confirmation expire n'apprend rien a la personne, ce qui
 * l'interesse c'est de savoir qu'elle peut recommencer.
 *
 * `noindex` : une page de confirmation n'a aucun sens dans un moteur de
 * recherche, et quelqu'un qui y arriverait par une recherche lirait une
 * confirmation pour une inscription qu'il n'a jamais demandee.
 */
export const metadata: Metadata = {
  title: "Inscription confirmée",
  description: "Votre inscription au carnet du studio BLF Lab's est confirmée.",
  robots: { index: false, follow: true },
};

export default async function InscriptionConfirmeePage({
  searchParams,
}: {
  searchParams: Promise<{ echec?: string }>;
}) {
  const { echec } = await searchParams;

  return (
    <>
      <Header />

      <main id="contenu" className="flex flex-1 items-center">
        <div className="section mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          {echec === "1" ? (
            <>
              <p className="mono text-sm text-muted">Lien expiré</p>
              <h1 className="title mt-6 text-4xl sm:text-5xl">
                Ce lien n&rsquo;est plus valable
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-muted">
                Un lien de confirmation vaut sept jours. Passé ce délai, aucune
                adresse n&rsquo;est conservée : il suffit de refaire
                l&rsquo;inscription pour en recevoir un nouveau.
              </p>
              <p className="mt-8">
                <Link className="underline" href="/">
                  Revenir à l&rsquo;accueil
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="mono text-sm text-muted">Inscription confirmée</p>
              <h1 className="title mt-6 text-4xl sm:text-5xl">
                Vous êtes <span className="grad-text">dans la boucle</span>
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-muted">
                Un premier message arrive tout de suite, il explique en trois
                lignes ce que vous allez recevoir. Ensuite, ce sera{" "}
                <strong className="text-ink">un email par mois</strong>, pas
                davantage.
              </p>
              <p className="mt-6 leading-relaxed text-muted">
                Chaque message porte un lien de retrait qui fonctionne en un
                clic, sans justification à donner. Pour toute question,{" "}
                <a className="underline" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>{" "}
                arrive dans une vraie boîte.
              </p>
              <p className="mt-10">
                <Link className="underline" href="/references">
                  Voir les réalisations du studio
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
