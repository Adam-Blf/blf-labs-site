import Link from "next/link";
import { Graduation } from "@/components/ui/Graduation";

/**
 * Hero pleine hauteur, en direction "laboratoire".
 *
 * Les deux disques flous qui occupaient ce fond ont ete retires. Un halo de
 * couleur diffuse derriere un titre est le decor par defaut des maquettes
 * generees, et c'est exactement ce qui donnait au site son air de gabarit. Ils
 * sont remplaces par la grille millimetree de la paillasse : elle donne de la
 * matiere au fond sans ajouter de couleur, et elle appartient au sujet - un
 * studio qui s'appelle Lab's travaille sur du papier quadrille.
 *
 * Le fond en degrade vers le bas evite que la grille ne coure jusqu'au bord du
 * bloc suivant, ce qui ferait un raccord visible.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Papier quadrille. Decoratif, donc masque aux lecteurs d'ecran. */}
      <span
        aria-hidden="true"
        className="grille absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 sm:px-6 lg:px-8">
        {/* Pas de bandeau d'accroche au-dessus du titre : Adam l'a refuse deux
            fois. Le hero s'ouvre directement sur la phrase. */}
        <h1 className="title max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
          On construit votre logiciel.
          <br />
          <span className="grad-text">Vous en gardez les clés.</span>
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Sites, applications web et mobiles, outils data et IA. Un seul
          interlocuteur du cadrage à la mise en ligne, et le code, le nom de
          domaine et les accès livrés à votre nom.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          {/* Seul aplat colore de la page : l'action principale. Le violet
              vient du logo et ne sert qu'ici. */}
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

        <Graduation className="mt-24" />
      </div>
    </section>
  );
}
