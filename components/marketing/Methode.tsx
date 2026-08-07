const ETAPES = [
  {
    index: "01",
    title: "Cadrage",
    body: "Un echange pour comprendre le metier avant la technique. On en sort avec un perimetre ecrit, un prix et une date.",
  },
  {
    index: "02",
    title: "Maquette",
    body: "Les ecrans sont valides avant d'etre codes. C'est la que les allers-retours coutent le moins cher.",
  },
  {
    index: "03",
    title: "Developpement",
    body: "Chaque bloc termine est teste et mis en ligne sur une adresse privee. Vous suivez l'avancement sans rien installer.",
  },
  {
    index: "04",
    title: "Remise des cles",
    body: "Depot de code, nom de domaine et acces d'hebergement transferes a votre nom. Rien ne reste chez le prestataire.",
  },
];

/**
 * Deroulement d'un projet, en quatre cartes de verre.
 * Le grand numero en filigrane sert de repere visuel et n'est pas lu par les
 * lecteurs d'ecran, la liste ordonnee portant deja l'information de rang.
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

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((etape) => (
            <li key={etape.index} className="glass relative overflow-hidden p-8">
              <span
                aria-hidden="true"
                className="tabular absolute -right-2 -top-6 text-8xl font-black text-white/5"
              >
                {etape.index}
              </span>

              <div className="relative z-10">
                <h3 className="title text-xl sm:text-2xl">{etape.title}</h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-muted">
                  {etape.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
