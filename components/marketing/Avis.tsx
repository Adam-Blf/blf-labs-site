import { AVIS } from "@/content/avis";
import { SITE } from "@/lib/site";

/**
 * Section des avis clients, et son balisage.
 *
 * Le composant rend `null` tant qu'il n'y a pas d'avis. Ce n'est pas une
 * precaution defensive, c'est le comportement voulu : une section "ils nous
 * font confiance" vide, ou pire remplie de faux temoignages, coute plus de
 * credibilite qu'elle n'en apporte.
 *
 * Le balisage suit la meme regle. `AggregateRating` n'est emis que si des notes
 * reelles existent, et il n'est calcule que sur les avis qui en portent une :
 * inventer une moyenne, ou compter un avis sans note comme un 5, est
 * exactement ce que Google appelle du balisage trompeur.
 */
export function Avis() {
  if (AVIS.length === 0) return null;

  const notes = AVIS.filter((avis) => typeof avis.note === "number");

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.brand,
    url: SITE.url,
    review: AVIS.map((avis) => ({
      "@type": "Review",
      reviewBody: avis.texte,
      author: { "@type": "Person", name: avis.auteur },
      ...(avis.date ? { datePublished: avis.date } : {}),
      ...(typeof avis.note === "number"
        ? {
            reviewRating: {
              "@type": "Rating",
              ratingValue: avis.note,
              bestRating: 5,
            },
          }
        : {}),
    })),
    ...(notes.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              notes.reduce((total, avis) => total + (avis.note ?? 0), 0) /
              notes.length
            ).toFixed(1),
            reviewCount: notes.length,
            bestRating: 5,
          },
        }
      : {}),
  };

  return (
    <section className="rule-t">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title max-w-3xl text-4xl sm:text-5xl">
          Ce qu&rsquo;ils en <span className="grad-text">disent</span>
        </h2>

        <ul className="mt-14 grid gap-6 md:grid-cols-2">
          {AVIS.map((avis) => (
            <li key={avis.auteur} className="blk flex flex-col gap-6 p-8">
              {/* `blockquote` et non un paragraphe : c'est une citation, et
                  c'est ce que restitue un lecteur d'ecran. */}
              <blockquote className="text-lg leading-relaxed text-ink">
                &laquo;&nbsp;{avis.texte}&nbsp;&raquo;
              </blockquote>

              <div className="mt-auto">
                <p className="font-semibold text-ink">{avis.auteur}</p>
                {avis.role && (
                  <p className="mt-1 text-sm text-muted">{avis.role}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
