import { SITE } from "@/lib/site";

/**
 * Donnees structurees schema.org, injectees dans la page d'accueil.
 *
 * A quoi elles servent : elles donnent aux moteurs et aux assistants une
 * description lisible par une machine de ce qu'est l'entreprise, ce qu'elle
 * vend et ou elle intervient. C'est ce qui permet d'apparaitre dans un panneau
 * de connaissances ou d'etre cite en reponse a "studio de developpement en
 * Ile-de-France" plutot que d'etre seulement une page de plus.
 *
 * DECISION DE CONFIDENTIALITE, a ne pas defaire par inadvertance.
 * Le balisage declare la ZONE desservie (Ile-de-France) mais PAS l'adresse
 * postale. L'entreprise est une entreprise individuelle domiciliee au domicile
 * d'Adam : l'adresse figure dans les mentions legales, ou la loi l'exige et ou
 * elle est lue par un humain, mais la publier en donnees structurees la rend
 * moissonnable par n'importe quel agregateur, qui la rediffusera comme adresse
 * commerciale sans qu'on puisse la retirer ensuite. Le numero de telephone est
 * absent pour la meme raison.
 *
 * Le SIRET est en revanche present : c'est une donnee publique d'entreprise,
 * consultable par tous sur le registre, et il sert d'identifiant fiable.
 */
export function JsonLd() {
  const donnees = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "BLF Lab's",
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    description:
      "Studio indépendant de développement : sites, applications web et mobiles, outils data et IA. Un seul interlocuteur du cadrage à la mise en ligne.",
    founder: { "@type": "Person", name: "Adam Beloucif" },
    foundingDate: SITE.registeredAt,
    identifier: [
      { "@type": "PropertyValue", name: "SIRET", value: SITE.siret },
      { "@type": "PropertyValue", name: "SIREN", value: SITE.siren },
    ],
    // Zone d'intervention, sans adresse : voir la note ci-dessus.
    areaServed: [
      { "@type": "AdministrativeArea", name: "Île-de-France" },
      { "@type": "Country", name: "France" },
    ],
    knowsLanguage: ["fr", "en", "es"],
    priceRange: "€€",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prestations",
      itemListElement: [
        "Sites vitrines et boutiques en ligne",
        "Applications web et SaaS",
        "Applications mobiles iOS et Android",
        "Data, IA et automatisation",
      ].map((nom) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: nom },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      // Le contenu est construit ici, à partir de constantes du depot : aucune
      // saisie utilisateur n'y entre, donc rien a echapper.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }}
    />
  );
}
