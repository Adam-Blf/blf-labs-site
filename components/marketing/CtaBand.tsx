import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Appel a l'action de fin de page : titre monumental et halos colores.
 */
export function CtaBand() {
  return (
    <section className="relative overflow-hidden">
      <span
        aria-hidden="true"
        className="halo left-1/4 top-0 h-[30rem] w-[30rem] bg-white/25/10"
      />
      <span
        aria-hidden="true"
        className="halo bottom-0 right-1/4 h-[30rem] w-[30rem] bg-white/5"
      />

      <div className="section relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="title mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
          Construisons quelque chose{" "}
          <span className="grad-text">qui vous appartient</span>
        </h2>

        <p className="mx-auto mt-8 max-w-xl text-lg font-light text-muted">
          Decrivez votre projet, meme grossierement. Vous recevez une reponse
          avec une estimation de budget et de delai.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/commander"
            className="btn-pill bg-accent px-8 py-4 font-semibold text-accent-ink"
          >
            Demarrer un projet
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
