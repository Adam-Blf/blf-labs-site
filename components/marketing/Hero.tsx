import Link from "next/link";

/**
 * Hero "manifeste".
 *
 * Troisieme version, apres deux rejets pour cause de rendu generique. Les deux
 * precedentes suivaient le schema titre court, sous-titre explicatif, deux
 * boutons, celui de n'importe quelle page d'accueil de studio.
 *
 * Ici : une seule affirmation, en tres gros, qui occupe l'ecran. Aucun bouton
 * au premier coup d'oeil, seulement une invitation a descendre. Le pari assume
 * est qu'une phrase qui engage retient plus qu'une promesse tiede.
 *
 * L'affirmation est defendable et pas seulement percutante : le studio remet au
 * client le depot de code, le nom de domaine et les acces d'hebergement, ce qui
 * n'est le cas ni d'un logiciel en abonnement, ni d'une agence qui conserve le
 * code. Elle vise une pratique du marche, aucun concurrent nomme.
 */
export function Hero() {
  return (
    <section className="rule-b flex min-h-[calc(100svh-5rem)] items-center">
      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <h1 className="title max-w-5xl text-balance text-[2.5rem] leading-[1.08] sm:text-6xl lg:text-7xl">
          La plupart des logiciels qu&rsquo;on vous vend ne vous appartiennent
          pas.
          <br />
          <span className="text-accent">Les notres, si.</span>
        </h1>

        <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">
          Sites, applications web et mobiles, outils data. A la livraison, le
          code, le nom de domaine et les acces sont a votre nom.
        </p>

        {/* Invitation a descendre plutot qu'un bouton : la page se lit, elle ne
            se consomme pas en un clic. Le lien reste un vrai lien d'ancrage,
            donc utilisable au clavier et annonce correctement. */}
        <Link
          href="/#offre"
          className="mono mt-16 inline-flex min-h-[44px] items-center gap-3 text-sm uppercase text-muted transition-colors hover:text-ink"
        >
          Ce qu&rsquo;on fabrique
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
