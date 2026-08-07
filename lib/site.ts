/**
 * Source unique de verite sur l'entreprise.
 *
 * Toute page legale, tout pied de page et tout email lit ces valeurs. Aucune
 * n'est reecrite a la main ailleurs : un SIRET faux avait deja circule sur un
 * projet precedent parce que la valeur etait dupliquee dans plusieurs fichiers.
 *
 * SIREN et SIRET ci-dessous passent la cle de Luhn (verifie le 2026-08-07).
 */
export const SITE = {
  brand: "BLF Lab's",
  // Raison sociale au RNE : l'entreprise individuelle est immatriculee au
  // patronyme, "BLF Lab's" n'est que le nom commercial. Formulation exacte
  // exigee tant que le nom commercial n'est pas declare.
  legalName: "Adam Beloucif",
  legalMention: "Adam Beloucif, exercant sous le nom commercial BLF Lab's",
  legalForm: "Entrepreneur individuel",
  siren: "108386855",
  siret: "10838685500010",
  ape: "6201Z",
  apeLabel: "Programmation informatique",
  registeredAt: "2026-08-04",
  address: {
    street: "6 impasse Edouard Vaillant",
    postalCode: "94550",
    city: "Chevilly-Larue",
    country: "France",
  },
  /**
   * Adresse de contact PUBLIQUE : mentions legales, pied de page, accuse de
   * reception client. Elle porte le nom de domaine de l'entreprise, ce qui est
   * ce qu'un client doit voir.
   */
  email: "adam@beloucif.com",

  /**
   * Adresse qui recoit reellement les notifications de commande.
   *
   * Elle est volontairement DIFFERENTE de l'adresse publique. adam@beloucif.com
   * n'est pas une boite, c'est une redirection OVH vers cette adresse Gmail, et
   * une redirection est un maillon fragile : le serveur qui relaie change l'IP
   * d'expedition sans changer l'enveloppe, donc la verification SPF echoue a
   * l'arrivee et Gmail classe le message en indesirable, voire le refuse en
   * silence. C'est ce qui faisait disparaitre les demandes de projet.
   *
   * En livrant la notification directement a la boite finale, le relais
   * disparait et l'authentification du message reste intacte de bout en bout.
   * L'adresse publique, elle, ne change pas.
   */
  notificationEmail: "adambeloucif@gmail.com",
  domain: "beloucif.com",
  url: "https://beloucif.com",
  // Franchise en base : aucune TVA facturee, mention obligatoire sur les devis
  // et factures.
  vat: "TVA non applicable, article 293 B du Code général des impots",
  mediator: {
    name: "CM2C",
    fullName: "Centre de la médiation de la consommation de conciliateurs de justice",
    url: "https://www.cm2c.net",
    address: "14 rue Saint Jean, 75017 Paris",
    validUntil: "2029-08-05",
  },
  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, Etats-Unis",
    url: "https://vercel.com",
  },
} as const;

export const FULL_ADDRESS = `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}, ${SITE.address.country}`;

/** SIRET formate pour la lecture humaine : 3 / 3 / 3 / 5. */
export const SIRET_PRETTY = `${SITE.siret.slice(0, 3)} ${SITE.siret.slice(3, 6)} ${SITE.siret.slice(6, 9)} ${SITE.siret.slice(9)}`;
