import { FAQ } from "@/content/faq";

/**
 * Balisage `FAQPage` de la page Questions.
 *
 * La page existait deja et les reponses etaient bonnes, mais elles n'etaient
 * lisibles que par un humain. Ce balisage les rend eligibles au bloc de
 * questions deroulantes dans les resultats Google, qui occupe plusieurs fois la
 * hauteur d'un resultat ordinaire.
 *
 * Regle a ne pas enfreindre : le contenu balise doit etre VISIBLE sur la page,
 * mot pour mot. Baliser une reponse qu'on n'affiche pas, ou l'enjoliver dans le
 * balisage, est une manipulation que Google sanctionne. D'ou la lecture directe
 * de `content/faq.ts`, la meme source que l'accordeon : les deux ne peuvent pas
 * diverger.
 */
export function FaqJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
