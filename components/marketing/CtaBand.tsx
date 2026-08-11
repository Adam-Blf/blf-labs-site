import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Appel a l'action de fin de page : titre monumental sur grille millimetree.
 */
export function CtaBand() {
  return (
    <section className="relative overflow-hidden">

      <div className="section relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="title mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
          Construisons quelque chose{" "}
          <span className="grad-text">qui vous appartient</span>
        </h2>

        <p className="mx-auto mt-8 max-w-xl text-lg font-light text-muted">
          Décrivez votre projet, même grossièrement. Vous recevez une réponse
          sous 48 heures ouvrées, avec une estimation de budget et de délai.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/commander"
            className="btn-pill bg-accent px-8 py-4 font-semibold text-accent-ink"
          >
            Démarrer un projet
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="btn-pill glass-sm px-8 py-4 font-medium"
          >
            {SITE.email}
          </a>
        </div>
      </div>
    </section>
  );
}
