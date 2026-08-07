/**
 * Deroulement d'un projet.
 *
 * Reecrit apres audit : quatre cartes alignees et numerotees cote a cote, c'est
 * le motif "process steps" que porte toute page d'agence. Remplace par une
 * chronologie verticale, ou le filet continu materialise le fil du projet et ou
 * les blocs sont volontairement decales.
 *
 * Le texte a ete resserre au passage : les formules de brochure ("vous ne
 * decouvrez jamais le resultat a la fin") ont ete remplacees par ce qui se
 * passe reellement.
 */
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

export function Methode() {
  return (
    <section id="methode" className="rule-b bg-surface">
      <div className="section mx-auto max-w-6xl px-5">
        <div className="flex items-baseline gap-6">
          <span className="marginalia text-sm">02</span>
          <h2 className="title text-3xl md:text-5xl">Comment ca se passe</h2>
        </div>

        {/* Le filet vertical est purement decoratif, il est donc masque aux
            lecteurs d'ecran, qui recoivent deja une liste ordonnee. */}
        <ol className="relative mt-16 max-w-3xl md:ml-16">
          <span
            aria-hidden="true"
            className="absolute left-[7px] top-2 bottom-2 w-px bg-line md:left-[-2.5rem]"
          />

          {ETAPES.map((etape) => (
              <li key={etape.index} className="relative pb-14 pl-10 last:pb-0 md:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[10px] block h-[15px] w-[15px] rounded-full border border-line bg-paper md:left-[-3rem]"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-[4px] top-[14px] block h-[7px] w-[7px] rounded-full bg-accent md:left-[-2.75rem]"
                />

                <span className="marginalia tabular text-xs">{etape.index}</span>
                <h3 className="title mt-2 text-2xl md:text-3xl">{etape.title}</h3>
                <p className="mt-3 max-w-xl leading-relaxed text-muted">
                  {etape.body}
                </p>
              </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
