import type { CSSProperties } from "react";
import { KeyIcon } from "@phosphor-icons/react/ssr";

/**
 * Ligne BLF, le plan de ligne du hero.
 *
 * C'est la these du site en un objet : un projet est un trajet de quatre
 * stations, et le terminus est l'offre elle-meme, la remise des cles. Chaque
 * texte reprend la methode telle qu'elle est ecrite dans Methode.tsx, sans
 * promesse de plus.
 *
 * Geometrie : chaque station non terminale trace son propre segment jusqu'a la
 * suivante, depuis le centre de sa pastille (28 px, centre a 14 px) jusqu'au
 * bas de l'element de liste. La pastille suivante recouvre la jonction. Aucune
 * hauteur n'est calculee en JavaScript, la ligne suit le texte a toute largeur.
 */
const ARRETS = [
  { nom: "Cadrage", texte: "Un périmètre écrit, un prix et une date." },
  { nom: "Maquette", texte: "Les écrans sont validés avant d'être codés." },
  {
    nom: "Développement",
    texte: "Chaque bloc est testé et mis en ligne sur une adresse privée.",
  },
];

const CLES = ["Dépôt de code", "Nom de domaine", "Accès d'hébergement"];

function ordre(index: number) {
  return { "--i": index } as CSSProperties;
}

export function LigneBlf() {
  return (
    <figure
      aria-labelledby="ligne-blf-titre"
      className="blk overflow-hidden rounded-[var(--radius)]"
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-signe px-6 py-4 text-signe-ink">
        <span id="ligne-blf-titre" className="title text-3xl">
          Ligne BLF
        </span>
        <span className="mono text-sm text-signe-muted">
          Direction remise des clés
        </span>
      </figcaption>

      <ol className="px-6 pb-8 pt-8">
        {ARRETS.map((arret, index) => (
          <li key={arret.nom} className="relative flex gap-5 pb-9" style={ordre(index)}>
            <span
              aria-hidden="true"
              className="ligne-trace absolute left-[11px] top-3.5 h-full w-[6px] rounded-full bg-accent"
            />
            <span
              aria-hidden="true"
              className="arret relative z-10 h-7 w-7 shrink-0 rounded-full border-[5px] border-ink bg-surface"
            />
            <div className="-mt-0.5">
              <p className="title text-2xl">{arret.nom}</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">
                {arret.texte}
              </p>
            </div>
          </li>
        ))}

        <li className="relative flex gap-4" style={ordre(ARRETS.length)}>
          <span
            aria-hidden="true"
            className="arret relative z-10 -ml-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full border-[5px] border-ink bg-accent text-accent-ink"
          >
            <KeyIcon weight="bold" className="h-5 w-5" />
          </span>
          <div className="-mt-1.5">
            <p className="title text-4xl">Remise des clés</p>
            <ul className="mt-4 space-y-2">
              {CLES.map((cle) => (
                <li key={cle} className="flex items-center gap-3 font-medium text-muted-strong">
                  <span aria-hidden="true" className="h-[6px] w-4 rounded-full bg-accent" />
                  {cle}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-semibold text-ink">Transférés à votre nom.</p>
          </div>
        </li>
      </ol>
    </figure>
  );
}
