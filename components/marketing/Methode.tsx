import { KeyIcon } from "@phosphor-icons/react/ssr";

const ETAPES = [
  {
    title: "Cadrage",
    body: "Un échange pour comprendre le métier avant la technique. On en sort avec un périmètre écrit, un prix et une date.",
  },
  {
    title: "Maquette",
    body: "Les écrans sont validés avant d'être codés. C'est là que les allers-retours coûtent le moins cher.",
  },
  {
    title: "Développement",
    body: "Chaque bloc terminé est testé et mis en ligne sur une adresse privée. Vous suivez l'avancement sans rien installer.",
  },
  {
    title: "Remise des clés",
    body: "Dépôt de code, nom de domaine et accès d'hébergement transférés à votre nom. Rien ne reste chez le prestataire.",
  },
];

/**
 * Deroulement d'un projet, en ligne de quatre stations.
 *
 * Horizontale sur grand ecran, verticale sur telephone. Chaque station trace
 * son segment jusqu'a la suivante depuis le centre de sa pastille (40 px,
 * centre a 20 px) : vers la droite de la largeur d'une colonne plus
 * l'espacement, ou vers le bas de la hauteur de l'element plus l'espacement.
 * Le terminus, la remise des cles, porte la seule pastille pleine.
 *
 * Aucune numerotation affichee : l'ordre est porte par la ligne elle-meme.
 */
export function Methode() {
  return (
    <section id="méthode" className="relative">
      <div className="section relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title max-w-3xl text-5xl sm:text-6xl lg:text-7xl">
          Comment <span className="grad-text">ça se passe</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Quatre temps, toujours les mêmes, quelle que soit la taille du projet.
        </p>

        <ol className="mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
          {ETAPES.map((etape, index) => {
            const terminus = index === ETAPES.length - 1;

            return (
              <li key={etape.title} className="relative pl-16 lg:pl-0 lg:pt-16">
                {!terminus && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[17px] top-5 h-[calc(100%+2.5rem)] w-[6px] rounded-full bg-accent lg:top-[17px] lg:left-5 lg:h-[6px] lg:w-[calc(100%+1.5rem)]"
                  />
                )}

                {terminus ? (
                  <span
                    aria-hidden="true"
                    className="absolute -left-0.5 -top-0.5 z-10 grid h-11 w-11 place-items-center rounded-full border-[5px] border-ink bg-accent text-accent-ink"
                  >
                    <KeyIcon weight="bold" className="h-5 w-5" />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 z-10 h-10 w-10 rounded-full border-[5px] border-ink bg-surface"
                  />
                )}

                <h3 className="title pt-1.5 text-3xl lg:pt-0">{etape.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{etape.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
