import Link from "next/link";
import {
  AppWindowIcon,
  ArrowRightIcon,
  DatabaseIcon,
  DeviceMobileIcon,
  GlobeIcon,
} from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { OFFRES, type OffreSlug } from "@/content/offres";

/**
 * Services, en plan de reseau : une offre, une ligne.
 *
 * Chaque famille garde sa couleur de ligne sur tout le site. Les outils
 * reellement utilises sont poses comme les stations de cette ligne, ce qui
 * remplace la rangee d'etiquettes et dit la meme chose : par ou passe le
 * projet.
 *
 * Plus de grille de cartes identiques : quatre rangees reglees, qu'on lit de
 * haut en bas comme un index de lignes. Les pictogrammes Icons8 dessines a la
 * main sont remplaces par Phosphor, seul jeu d'icones du site.
 *
 * Les classes de couleur sont ecrites en entier ici : Tailwind ne genere que les
 * classes qu'il lit litteralement dans le source.
 */
const LIGNES: Record<
  OffreSlug,
  { Icone: typeof GlobeIcon; pastille: string; trait: string; station: string }
> = {
  "sites-web": {
    Icone: GlobeIcon,
    pastille: "bg-ligne-sites",
    trait: "before:bg-ligne-sites",
    station: "border-ligne-sites",
  },
  "apps-web": {
    Icone: AppWindowIcon,
    pastille: "bg-ligne-web",
    trait: "before:bg-ligne-web",
    station: "border-ligne-web",
  },
  "apps-mobiles": {
    Icone: DeviceMobileIcon,
    pastille: "bg-ligne-mobile",
    trait: "before:bg-ligne-mobile",
    station: "border-ligne-mobile",
  },
  "data-ia": {
    Icone: DatabaseIcon,
    pastille: "bg-ligne-data",
    trait: "before:bg-ligne-data",
    station: "border-ligne-data",
  },
};

export function OffreGrid({
  niveau = 2,
}: {
  /**
   * Niveau du titre. La section est montee sur l'accueil, ou le Hero porte
   * deja le <h1>, et sur /services, ou elle est le sujet de la page. Sans ce
   * reglage, /services n'avait aucun <h1> : naviguer par titres, le geste le
   * plus courant au lecteur d'ecran, n'y donnait aucun point d'entree.
   */
  niveau?: 1 | 2;
} = {}) {
  const Titre = niveau === 1 ? "h1" : "h2";
  // Les titres d'offre descendent d'un cran avec le titre de section, sinon la
  // page dediee saute du h1 au h3 et l'ordre des titres n'est plus lisible.
  const SousTitre = niveau === 1 ? "h2" : "h3";

  return (
    <section id="offre" className="relative">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Titre className="title max-w-3xl text-5xl sm:text-6xl lg:text-7xl">
          Des services conçus pour{" "}
          <span className="grad-text">votre activité</span>
        </Titre>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Quatre familles de projets. Si le vôtre tient dans plusieurs cases, ou
          dans aucune, c&rsquo;est une conversation, pas un problème.
        </p>

        <Reveal className="mt-16 border-b border-line">
          {OFFRES.map((offre) => {
            const ligne = LIGNES[offre.slug];

            return (
              <Link
                key={offre.slug}
                href={`/offre/${offre.slug}`}
                className="group grid gap-8 border-t border-line py-10 md:grid-cols-12 md:gap-10 md:py-12"
              >
                <div className="flex items-start gap-5 md:col-span-5">
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-ligne-ink ${ligne.pastille}`}
                  >
                    <ligne.Icone aria-hidden="true" weight="bold" className="h-7 w-7" />
                  </span>
                  <SousTitre className="title pt-1.5 text-3xl sm:text-4xl">
                    {offre.title}
                  </SousTitre>
                </div>

                <div className="md:col-span-7">
                  <p className="text-lg leading-relaxed text-muted">
                    {offre.pitch}
                  </p>

                  <ul
                    className={`relative mt-8 flex justify-between gap-2 before:absolute before:inset-x-2.5 before:top-[7px] before:h-[6px] before:rounded-full ${ligne.trait}`}
                  >
                    {offre.stack.map((outil) => (
                      <li
                        key={outil}
                        className="relative flex min-w-0 flex-col items-center gap-2 text-center"
                      >
                        <span
                          aria-hidden="true"
                          className={`h-5 w-5 rounded-full border-[5px] bg-surface ${ligne.station}`}
                        />
                        <span className="text-xs font-semibold text-muted-strong sm:text-sm">
                          {outil}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <span className="mono mt-9 inline-flex items-center gap-2 text-base text-ink">
                    En savoir plus
                    <ArrowRightIcon
                      aria-hidden="true"
                      weight="bold"
                      className="h-4 w-4 transition-transform duration-200 ease-snap group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
