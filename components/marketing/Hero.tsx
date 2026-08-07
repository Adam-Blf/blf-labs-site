import { ButtonLink } from "@/components/ui/Button";
import { SITE, SIRET_PRETTY } from "@/lib/site";

export function Hero() {
  return (
    <section className="rule-b">
      <div className="section mx-auto max-w-6xl px-5">
        <p className="mono text-xs uppercase tracking-[0.2em] text-muted">
          Studio de developpement - Ile-de-France
        </p>

        <h1 className="title mt-6 text-5xl md:text-7xl lg:text-8xl">
          On transforme
          <br />
          votre besoin
          <br />
          {/* L'aplat porte son encre invariante, jamais var(--ink). */}
          <span className="inline-block bg-accent px-3 text-accent-ink">
            en logiciel
          </span>{" "}
          qui tourne.
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          Sites, applications web et mobiles, outils data et IA. Du cadrage a la
          mise en ligne, avec le code et les acces qui restent chez vous.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/commander">Commander un projet</ButtonLink>
          <ButtonLink href="/#offre" variant="ghost">
            Voir l&rsquo;offre
          </ButtonLink>
        </div>

        <dl className="tabular rule-t mono mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4 pt-6 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted">SIRET</dt>
            <dd className="mt-1 font-bold">{SIRET_PRETTY}</dd>
          </div>
          <div>
            <dt className="text-muted">Code APE</dt>
            <dd className="mt-1 font-bold">{SITE.ape}</dd>
          </div>
          <div>
            <dt className="text-muted">Immatricule</dt>
            <dd className="mt-1 font-bold">04.08.2026</dd>
          </div>
          <div>
            <dt className="text-muted">Base a</dt>
            <dd className="mt-1 font-bold">{SITE.address.city}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
