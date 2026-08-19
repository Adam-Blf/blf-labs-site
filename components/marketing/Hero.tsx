import Link from "next/link";
import { HeroSceneMount } from "@/components/three/HeroSceneMount";

/**
 * Hero, dimensionne pour tenir dans le premier ecran.
 *
 * Le titre etait en `text-8xl` sur cinq lignes : a lui seul il remplissait
 * l'ecran et poussait le sous-titre, les boutons et toute preuve sous la ligne
 * de flottaison. On le ramene a une echelle qui laisse voir, sans scroller,
 * l'action principale et une bande de preuve. Le decor reste la grille de
 * paillasse et la fiole 3D du logo, pas un halo de couleur (aesthetic generique).
 */

const PREUVES = [
  "Le code livré à votre nom",
  "Nom de domaine et accès inclus",
  "Un seul interlocuteur, du cadrage à la mise en ligne",
];

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Papier quadrille. Decoratif, donc masque aux lecteurs d'ecran. */}
      <span
        aria-hidden="true"
        className="grille absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <HeroSceneMount />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6 lg:px-8">
        <h1 className="title max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
          On construit votre logiciel.
          <br />
          <span className="grad-text">Vous en gardez les clés.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Sites, applications web et mobiles, outils data et IA. Un seul
          interlocuteur du cadrage à la mise en ligne, et le code, le nom de
          domaine et les accès livrés à votre nom.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {/* Seul aplat colore de la page : l'action principale. */}
          <Link
            href="/commander"
            className="btn-pill bg-accent px-8 py-4 font-bold text-accent-ink"
          >
            Démarrer un projet
          </Link>
          <Link
            href="/services"
            className="btn-pill border border-line-strong px-8 py-4 font-medium text-ink"
          >
            Voir les services
          </Link>
        </div>

        {/* Bande de preuve, au-dessus de la ligne de flottaison. */}
        <ul className="mt-12 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-8">
          {PREUVES.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
