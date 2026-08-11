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
 * Deroulement d'un projet.
 *
 * Aucune numerotation affichee : l'ordre est porte par la liste ordonnee et par
 * la lecture de gauche a droite. Un compteur en gros chiffre est un tic de page
 * d'agence, et il n'apporte rien que la position ne dise deja.
 */
export function Methode() {
  return (
    <section id="méthode" className="relative">

      <div className="section relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
          Comment <span className="grad-text">ça se passe</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg font-light text-muted">
          Quatre temps, toujours les mêmes, quelle que soit la taille du projet.
        </p>

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((etape) => (
            <li key={etape.title} className="glass flex flex-col gap-4 p-8">
              {/* Filet colore en tete de carte : marque le rythme sans
                  recourir a un chiffre. */}
              <span
                aria-hidden="true"
                className="h-px w-10 bg-gradient-to-r from-orange to-rose"
              />
              <h3 className="title text-xl sm:text-2xl">{etape.title}</h3>
              <p className="text-sm font-light leading-relaxed text-muted">
                {etape.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
