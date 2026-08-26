import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE } from "@/lib/site";

/**
 * Confirmation apres envoi du formulaire de commande.
 *
 * Pourquoi une page et pas seulement l'etat en place qui existait :
 *
 * - Une adresse distincte est la seule facon de compter les demandes envoyees.
 *   Un changement d'etat dans un composant n'est visible par aucun outil de
 *   mesure, donc le taux de conversion du site n'etait pas mesurable.
 * - Le bouton retour du navigateur ramenait sur un formulaire deja envoye,
 *   pre-rempli, invitant a le renvoyer. Ici il ramene sur la page de commande
 *   vierge, ce qui est le comportement attendu.
 * - Une confirmation qui disparait au moindre rafraichissement laisse un doute
 *   reel : "est-ce que c'est parti ?" Une adresse qu'on peut recharger, non.
 *
 * `noindex` : cette page n'a aucun interet dans un resultat de recherche, et
 * quelqu'un qui y arriverait par Google verrait une confirmation pour une
 * demande qu'il n'a jamais envoyee. `follow` reste, pour que les liens de
 * sortie soient suivis.
 */
export const metadata: Metadata = {
  title: "Demande envoyée",
  description:
    "Votre demande de projet a bien été enregistrée. Réponse sous 48 heures ouvrées.",
  robots: { index: false, follow: true },
};

export default function MerciPage() {
  return (
    <>
      <Header />

      <main id="contenu" className="flex flex-1 items-center">
        <div className="section mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="mono text-sm text-muted">Demande enregistrée</p>

          <h1 className="title mt-6 text-4xl sm:text-6xl">
            C&rsquo;est <span className="grad-text">parti</span>
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-muted">
            Votre demande est arrivée. Vous recevez tout de suite un accusé de
            réception par email, puis une réponse écrite{" "}
            <strong className="text-ink">sous 48 heures ouvrées</strong>, avec
            une estimation de budget et de délai, ou une orientation ailleurs si
            ce n&rsquo;est pas pour nous.
          </p>

          <div className="blk mt-12 p-6">
            <p className="mono text-xs text-muted">Et si rien n&rsquo;arrive</p>
            <p className="mt-4 leading-relaxed text-muted">
              Vérifiez vos indésirables : l&rsquo;accusé de réception part
              automatiquement et finit parfois là. Sans nouvelles, écrivez
              directement à{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-ink underline underline-offset-4"
              >
                {SITE.email}
              </a>
              .
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
            >
              Retour à l&rsquo;accueil
            </Link>
            <Link
              href="/references"
              className="btn-pill border border-line-strong px-8 py-4 font-medium text-ink"
            >
              Voir les réalisations
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
