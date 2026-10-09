import Link from "next/link";
import { HeroSceneMount } from "@/components/three/HeroSceneMount";
import { Graduation } from "@/components/ui/Graduation";

/**
 * Hero, dimensionne pour tenir dans le premier ecran.
 *
 * Parti pris apres un premier jet juge "trop generique" : on s'en tient a la
 * direction artistique du site (themes.css) au lieu des reflexes d'une page
 * generee. Concretement -
 *  - angles droits partout : le site est "trace a la regle", plus de pilule ;
 *  - le violet n'est plus pose en ligne de titre coloree (le "payoff" colore
 *    est la signature des heros generes) ; l'accent passe par un SOULIGNEMENT
 *    au citron, seul usage prescrit de la couleur de tension ;
 *  - plus de trio de puces "benefice" sous les boutons : la meme promesse est
 *    deja portee par le sous-titre, le trio ne faisait que la repeter en gabarit.
 *
 * Le decor reste la grille de paillasse et la fiole 3D du logo, pas un halo de
 * couleur.
 */
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
        <p className="mono flex items-center gap-2.5 text-xs text-muted">
          <span aria-hidden="true" className="h-2 w-2 bg-support" />
          Studio logiciel indépendant
        </p>

        <h1 className="title mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
          On construit votre logiciel.
          <br />
          Vous en gardez les <span className="mark-citron">clés</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Sites, applications web et mobiles, outils data et IA. Un seul
          interlocuteur du cadrage à la mise en ligne, et le code, le nom de
          domaine et les accès livrés à votre nom.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
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

        {/*
          L'element signature, au bas du hero.

          Son propre en-tete l'annonce depuis le premier jour : « il apparait au
          bas du hero et en tete des grandes sections ». Il n'apparaissait qu'une
          fois, dans le pied de page, a 60 % d'opacite. La documentation
          decrivait un site qui n'existait pas.

          C'est aussi la reponse a l'audit design, qui reprochait au site d'avoir
          onze pages baties sur un gabarit recopie sans rien qui les signe : le
          remede n'etait pas d'importer un separateur de catalogue, c'etait
          d'utiliser celui qu'on avait deja ecrit.
        */}
        <Graduation className="mt-16" />
      </div>
    </section>
  );
}
