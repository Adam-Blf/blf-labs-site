import { ButtonLink } from "@/components/ui/Button";

/**
 * Hero de la page d'accueil.
 *
 * Reecrit le 2026-08-07. La version precedente cumulait trois tics de page
 * generee : un mot surligne en couleur au milieu du titre, une promesse vague
 * ("on transforme votre besoin"), et une rangee de chiffres administratifs
 * (SIRET, code APE, date d'immatriculation) presentee comme un argument de
 * vente. Un numero de SIRET ne vend rien : sa place est dans le pied de page et
 * les mentions legales, ou la loi l'exige.
 *
 * La promesse retenue est celle qui distingue reellement le studio d'une agence :
 * le client repart proprietaire de son code et de ses acces.
 */
export function Hero() {
  return (
    <section className="rule-b">
      <div className="section mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <p className="mono text-xs uppercase text-muted">
            Studio de developpement, Ile-de-France
          </p>

          {/* text-wrap: balance repartit les lignes de facon egale. Des retours
              forcés donnaient une ligne pleine suivie d'un mot orphelin, et
              cassaient a chaque changement de largeur d'ecran. */}
          <h1 className="title mt-6 text-balance text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-7xl">
            On construit votre outil. Vous en gardez les cles.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            Sites, applications web et mobiles, outils data. Un seul
            interlocuteur du cadrage a la mise en ligne, et le code, le domaine
            et les acces a votre nom.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/commander">Commander un projet</ButtonLink>
            <ButtonLink href="/#offre" variant="ghost">
              Voir l&rsquo;offre
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
