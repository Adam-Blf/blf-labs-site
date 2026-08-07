import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="bg-accent text-accent-ink">
      <div className="section mx-auto max-w-6xl px-5">
        <h2 className="title text-3xl md:text-5xl">Un projet en tete ?</h2>
        <p className="mt-4 max-w-xl text-lg">
          Decrivez-le en cinq minutes. Vous recevez une reponse avec une
          estimation de budget et de delai, ou une orientation ailleurs si ce
          n&rsquo;est pas pour nous.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href="/commander" variant="ghost">
            Passer commande
          </ButtonLink>
          <a
            href={`mailto:${SITE.email}`}
            className="mono text-sm underline underline-offset-4"
          >
            ou ecrire a {SITE.email}
          </a>
        </div>
      </div>
    </section>
  );
}
