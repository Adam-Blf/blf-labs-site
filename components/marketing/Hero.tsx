import Link from "next/link";
import { LigneBlf } from "./LigneBlf";

/**
 * Hero, refonte "ligne" du 2026-09-15.
 *
 * Le premier ecran montre le trajet entier au lieu d'un objet decoratif. La
 * fiole 3D et la grille millimetree sont retirees : elles racontaient un
 * laboratoire, coutaient trois bibliotheques au chargement, et ne prouvaient
 * rien sur ce que le client recoit. A leur place, la Ligne BLF expose la
 * methode et son terminus, la remise des cles, qui EST l'offre.
 *
 * Composition : le titre et les deux actions a gauche sur sept colonnes, le
 * plan de ligne a droite sur cinq. Sur telephone, le plan suit les actions.
 * Aucun surtitre au-dessus du titre : le titre porte son propre poids.
 *
 * Les deux colonnes s'alignent par le HAUT et non par leur milieu. Le plan de
 * ligne est plus haut que le titre et ses actions : les centrer l'un sur
 * l'autre faisait descendre le bouton sous la ligne de flottaison d'un
 * portable. Le titre et la premiere action se lisent donc d'entree, et c'est le
 * plan qui deborde sous le pli, ce qui est sa place : il detaille une methode
 * que personne ne lit avant d'avoir compris l'offre. Les tailles et les
 * respirations tenant compte de la hauteur de la fenetre sont dans
 * `globals.css`, classes `hero`, `hero-titre`, `hero-texte` et `hero-actions`.
 */
export function Hero() {
  return (
    <section className="relative">
      <div className="hero mx-auto grid w-full max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:items-start lg:gap-12 lg:px-8 2xl:gap-16 2xl:px-12">
        <div className="lg:col-span-7">
          <h1 className="title hero-titre">
            On construit votre logiciel.
            <br />
            Vous en gardez les <span className="grad-text">clés</span>.
          </h1>

          <p className="hero-texte max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Sites, applications web et mobiles, outils data et IA. Un seul
            interlocuteur du cadrage à la mise en ligne, et le code, le nom de
            domaine et les accès livrés à votre nom.
          </p>

          {/*
            Sur telephone, les deux actions sont empilees et pleine largeur : le
            pouce vise une barre, pas une etiquette posee a cote d'une autre.
            L'ordre les departage, la couleur aussi. A partir de `sm`, la place
            existe et elles se rangent sur une ligne.
          */}
          <div className="hero-actions flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/commander"
              className="btn-pill title inline-flex min-h-[54px] items-center justify-center bg-accent px-8 text-xl text-accent-ink sm:w-auto"
            >
              Démarrer un projet
            </Link>
            <Link
              href="/services"
              className="btn-pill title inline-flex min-h-[54px] items-center justify-center border-2 border-ink px-8 text-xl text-ink sm:w-auto"
            >
              Voir les services
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 2xl:col-span-6">
          <LigneBlf />
        </div>
      </div>
    </section>
  );
}
