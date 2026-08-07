const ETAPES = [
  {
    index: "01",
    title: "Cadrage",
    body: "Un echange pour comprendre le metier avant la technique. On sort avec un perimetre ecrit, un budget et une date.",
  },
  {
    index: "02",
    title: "Maquette",
    body: "Vous voyez les ecrans avant qu'ils soient codes. Les allers-retours se font la, ou ils ne coutent rien.",
  },
  {
    index: "03",
    title: "Developpement",
    body: "Livraisons regulieres plutot qu'un grand soir. Chaque bloc fini est teste et visible en ligne.",
  },
  {
    index: "04",
    title: "Mise en ligne",
    body: "Nom de domaine, hebergement et acces a votre nom. Vous repartez proprietaire, pas locataire.",
  },
];

export function Methode() {
  return (
    <section id="methode" className="rule-b bg-surface">
      <div className="section mx-auto max-w-6xl px-5">
        <h2 className="title text-3xl md:text-5xl">Comment ca se passe</h2>

        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {ETAPES.map((etape) => (
            <li key={etape.index} className="blk bg-paper p-6">
              <span className="tabular mono text-sm font-bold text-support">
                {etape.index}
              </span>
              <h3 className="title mt-3 text-xl">{etape.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {etape.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
