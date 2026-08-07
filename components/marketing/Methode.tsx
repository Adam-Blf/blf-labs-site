const ETAPES = [
  {
    title: "Cadrage",
    body: "Un echange pour comprendre le metier avant la technique. On en sort avec un perimetre ecrit, un prix et une date.",
  },
  {
    title: "Maquette",
    body: "Les ecrans sont valides avant d'etre codes. C'est la que les allers-retours coutent le moins cher.",
  },
  {
    title: "Developpement",
    body: "Chaque bloc termine est teste et mis en ligne sur une adresse privee. Vous suivez l'avancement sans rien installer.",
  },
  {
    title: "Remise des cles",
    body: "Depot de code, nom de domaine et acces d'hebergement transferes a votre nom. Rien ne reste chez le prestataire.",
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
    <section id="methode" className="relative">
      <span
        aria-hidden="true"
        className="halo left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 bg-[#ff6b4a]/5"
      />

      <div className="section relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
          Comment <span className="grad-text">ca se passe</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg font-light text-muted">
          Quatre temps, toujours les memes, quelle que soit la taille du projet.
        </p>

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((etape) => (
            <li key={etape.title} className="glass flex flex-col gap-4 p-8">
              {/* Filet colore en tete de carte : marque le rythme sans
                  recourir a un chiffre. */}
              <span
                aria-hidden="true"
                className="h-px w-10 bg-gradient-to-r from-[#f5a524] to-[#ff6b4a]"
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
