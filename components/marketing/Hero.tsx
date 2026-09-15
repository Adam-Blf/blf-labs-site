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
 */
export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="lg:col-span-7">
          <h1 className="title text-[3.1rem] sm:text-7xl xl:text-[5.4rem]">
            On construit votre logiciel.
            <br />
            Vous en gardez les <span className="grad-text">clés</span>.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Sites, applications web et mobiles, outils data et IA. Un seul
            interlocuteur du cadrage à la mise en ligne, et le code, le nom de
            domaine et les accès livrés à votre nom.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/commander"
              className="btn-pill title inline-flex min-h-[54px] items-center bg-accent px-8 text-xl text-accent-ink"
            >
              Démarrer un projet
            </Link>
            <Link
              href="/services"
              className="btn-pill title inline-flex min-h-[54px] items-center border-2 border-ink px-8 text-xl text-ink"
            >
              Voir les services
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <LigneBlf />
        </div>
      </div>
    </section>
  );
}
