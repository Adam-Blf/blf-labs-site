import Link from "next/link";
import { SITE } from "@/lib/site";
import { LigneStrip } from "@/components/ui/LigneStrip";

/**
 * Appel a l'action de fin de page : le placard de station.
 *
 * Un aplat plein sur toute la largeur, noir en clair et blanc en sombre. C'est
 * la seule region du site ou la couleur de fond change, et c'est ce qui la
 * signale comme la fin du trajet. Le mot mis en avant est souligne en jaune de
 * signalisation, le violet ne se detachant pas du placard.
 */
export function CtaBand() {
  return (
    <section className="bg-signe text-signe-ink">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <LigneStrip className="mb-14" />

        <h2 className="title max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
          Construisons quelque chose{" "}
          <span className="mark-citron">qui vous appartient</span>
        </h2>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-signe-muted">
          Décrivez votre projet, même grossièrement. Vous recevez une réponse
          sous 48 heures ouvrées, avec une estimation de budget et de délai.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link
            href="/commander"
            className="btn-pill title inline-flex min-h-[54px] items-center bg-accent px-8 text-xl text-accent-ink"
          >
            Démarrer un projet
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="btn-pill inline-flex min-h-[54px] items-center border-2 border-current px-7 font-semibold"
          >
            {SITE.email}
          </a>
        </div>
      </div>
    </section>
  );
}
