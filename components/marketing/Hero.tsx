import Link from "next/link";

/**
 * Hero pleine hauteur, titre monumental et halos colores.
 *
 * Les halos remplacent les photographies de ville de la specification
 * d'origine : ces images appartiennent au site source, on ne les reprend pas.
 * Deux disques flous, l'un bleu l'autre violet, produisent la meme profondeur
 * sans rien telecharger ni emprunter.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <span
        aria-hidden="true"
        className="halo left-[-10rem] top-[-6rem] h-[36rem] w-[36rem] bg-[#f5a524]/10"
      />
      <span
        aria-hidden="true"
        className="halo bottom-[-12rem] right-[-8rem] h-[40rem] w-[40rem] bg-[#ff6b4a]/10"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 sm:px-6 lg:px-8">
        <h1 className="title max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
          On construit votre logiciel.
          <br />
          <span className="grad-text">Vous en gardez les cles.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-muted sm:text-xl">
          Sites, applications web et mobiles, outils data et IA. Un seul
          interlocuteur du cadrage a la mise en ligne, et le code, le nom de
          domaine et les acces livres a votre nom.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/commander"
            className="btn-pill bg-white px-8 py-4 font-semibold text-[#0c1128]"
          >
            Demarrer un projet
          </Link>
          <Link
            href="/services"
            className="btn-pill glass-sm px-8 py-4 font-medium text-ink"
          >
            Voir les services
          </Link>
        </div>
      </div>

      {/* Indicateur de defilement, purement decoratif. */}
      <span
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce text-muted"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </section>
  );
}
