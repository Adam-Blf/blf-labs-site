/**
 * Fourchettes de budget affichees publiquement.
 *
 * REMPLI LE 25/08/2026, apres un audit a quatre angles puis une validation
 * juridique dediee. Ce fichier est reste volontairement vide jusque-la, et la
 * regle qui l'y maintenait n'a pas change : un montant affiche ENGAGE
 * l'entreprise, il doit venir d'Adam et non d'une estimation plausible.
 *
 * POURQUOI UNE SEULE LIGNE, ET PAS QUATRE.
 *
 * `sites-web` est la seule famille ou des projets ont ete reellement livres.
 * Publier un plancher sur `apps-web`, `apps-mobiles` ou `data-ia` serait
 * exactement l'invention que ce fichier interdit depuis le premier jour.
 *
 * Ces trois familles ne restent pas muettes pour autant : l'article L112-3 du
 * Code de la consommation impose un MODE DE CALCUL pour toute prestation dont
 * le prix ne peut pas etre calcule a l'avance, et l'obligation ne depend
 * d'aucune demande du client. La page publie donc le TAUX HORAIRE, qui est une
 * decision et non une extrapolation, et dit que le prix en resulte multiplie
 * par les heures estimees au cadrage. Voir `TAUX_HORAIRE` plus bas.
 *
 * POURQUOI PAS « HT », ET POURQUOI PAS « NETS DE TVA » NON PLUS.
 *
 * BLF Lab's est en franchise en base : il n'y a pas de TVA a ajouter, le prix
 * affiche EST le total du. « HT » suggere donc une taxe a venir, ce que
 * l'article 1er de l'arrete du 3 decembre 1987 interdit puisqu'il impose
 * d'annoncer la somme totale effectivement payee.
 *
 * « Nets de TVA » a d'abord ete ecrit ici, et c'etait pire : dans l'usage
 * commercial, « net de TVA » signifie DEDUCTION FAITE de la TVA, donc hors
 * taxes. La formule disait l'inverse de ce qu'elle voulait dire. Le champ
 * `mention_prix` porte desormais la qualification en clair.
 *
 * POURQUOI `hors_forfait` EXISTE.
 *
 * Article 3 du meme arrete : lorsque le prix annonce ne comprend pas un element
 * INDISPENSABLE a la finalite du service, cette particularite doit etre
 * indiquee explicitement. Un nom de domaine et un hebergement sont
 * indispensables a un site en ligne. Les nommer deux sections plus bas ne
 * suffit pas, ils doivent figurer dans le bloc du prix.
 *
 * SI UN DEVIS PASSE UN JOUR SOUS CE PLANCHER, c'est la page qu'on corrige, pas
 * une exception qu'on s'accorde.
 *
 * ET LA REGLE SYMETRIQUE, qui manquait : si un devis DEPASSE le plancher pour
 * un perimetre que `couvre` decrit, alors c'est le plancher qui est faux.
 * L'article L121-4 repute trompeuse en toutes circonstances la pratique
 * consistant a annoncer un prix sans pouvoir fournir a ce prix. Le calcul de
 * couts et le releve des offres comparables qui fondent ces montants sont
 * conserves : l'article L111-5 fait peser la preuve sur le professionnel.
 */
export type Fourchette = {
  /** Doit correspondre au slug d'une offre de content/offres.ts. */
  offre: string;
  /** Plancher affiche, par exemple "a partir de 2 500 EUR". */
  plancher: string;
  /**
   * Qualification du prix, exigee par l'article 1er de l'arrete du 3 decembre
   * 1987 : le visiteur doit savoir que rien ne s'ajoute au montant affiche.
   */
  mention_prix: string;
  /** Ce que ce plancher couvre, en une phrase. */
  couvre: string;
  /** Ce qui fait monter le prix, en une phrase. */
  fait_monter: string;
  /**
   * Ce que le prix annonce NE comprend pas, alors que c'est indispensable a la
   * finalite du service. Article 3 de l'arrete du 3 decembre 1987.
   */
  hors_forfait: string;
  /**
   * Date d'effet. Un prix publie sans date se lit comme le prix d'aujourd'hui,
   * indefiniment - et il deviendrait faux le jour du passage a la TVA.
   */
  date_effet: string;
};

/**
 * Unite de facturation publiee, pour les prestations sans plancher.
 *
 * C'est un TAUX HORAIRE et non un taux journalier, deliberement. Un taux
 * journalier invite le client a convertir en journees ouvrees, et le studio ne
 * travaille pas en journees : annoncer « cinq jours » pour ce qui prend cinq
 * semaines calendaires serait un mensonge sur le calendrier, pas sur le prix.
 */
export const TAUX_HORAIRE = "30 €";

export const FOURCHETTES: Fourchette[] = [
  {
    offre: "sites-web",
    plancher: "à partir de 600 €",
    mention_prix:
      "Prix total à payer. TVA non applicable, article 293 B du Code général des impôts : aucune taxe ne s'ajoute à ce montant, et il n'ouvre droit à aucune déduction de TVA.",
    couvre:
      "Un site de présentation complet : maquette validée avant développement, lisible sur téléphone comme sur écran large, avec ses mentions légales, sa politique de confidentialité et son bandeau de consentement conformes. Au paiement intégral, le code écrit pour votre projet vous est cédé : vous pouvez le faire reprendre par le développeur de votre choix, sans redevance et sans nous redemander l'autorisation. Les briques logicielles libres qu'il utilise restent sous leurs propres licences, qui vous laissent ce même droit. Aucun abonnement à BLF Lab's n'est nécessaire pour que le site continue de fonctionner.",
    fait_monter:
      "Tout ce qu'un visiteur peut faire en plus de lire : prendre rendez-vous avec gestion des créneaux, payer en ligne, disposer d'un espace personnel. Un back-office sur mesure pour piloter votre activité. Un site de ce périmètre complet démarre à 1 300 €, aux mêmes conditions de prix total.",
    hors_forfait:
      "Ne sont pas compris dans ce montant, alors qu'ils sont nécessaires pour qu'un site soit en ligne : le nom de domaine, son renouvellement annuel et l'hébergement. S'y ajoutent, si vous les demandez : la rédaction des contenus, l'identité visuelle, la reprise d'un site existant, le référencement éditorial, la formation à l'édition et la maintenance. Chacun de ces postes fait l'objet d'une ligne chiffrée au devis, jamais d'un supplément découvert à la fin.",
    date_effet:
      "Prix en vigueur au 25 août 2026. Seul le devis signé fixe le prix, le périmètre et le calendrier.",
  },
];
