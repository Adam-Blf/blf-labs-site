import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Bloc de fin.
 *
 * Reecrit apres audit : un bandeau de couleur pleine largeur avec titre centre
 * et bouton contrastant est le motif de cloture le plus courant du web. Ici,
 * pas d'aplat : l'adresse email est posee en tres grand et devient elle-meme
 * l'element graphique. C'est la signature de fin de page.
 */
export function CtaBand() {
  return (
    <section className="rule-b">
      <div className="section mx-auto max-w-6xl px-5">
        <div className="flex items-baseline gap-6">
          <span className="marginalia text-sm">05</span>
          <h2 className="title text-3xl md:text-5xl">Un projet en tete</h2>
        </div>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          Decrivez-le, meme grossierement. Vous recevez une reponse avec une
          estimation de budget et de delai, ou une orientation ailleurs si ce
          n&rsquo;est pas pour nous.
        </p>

        <div className="mt-14">
          <Link
            href="/commander"
            className="title inline-block text-4xl text-accent underline decoration-2 underline-offset-8 transition-colors hover:text-ink sm:text-6xl lg:text-7xl"
          >
            Passer commande
          </Link>
        </div>

        <p className="mt-10 text-muted">
          ou par email :{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="border-b border-current pb-1 transition-colors hover:text-accent"
          >
            {SITE.email}
          </a>
        </p>
      </div>
    </section>
  );
}
