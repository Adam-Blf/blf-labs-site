/**
 * Fourchettes de budget affichees publiquement.
 *
 * TROIS OFFRES, ET AUCUN CHIFFRE INVENTE.
 *
 * La regle qui gouverne ce fichier depuis le premier jour n'a pas change : un
 * montant affiche ENGAGE l'entreprise, et il ne doit pas venir d'une estimation
 * plausible. Elle est tenue ici, et il faut dire comment.
 *
 * Les trois planchers ne sont pas trois nombres choisis pour remplir une
 * grille. Ils sont le PRODUIT d'un taux horaire decide par Adam et d'un volume
 * d'heures rattache a un perimetre nomme :
 *
 *     Vitrine                            20 h  x 30 EUR  =    600 EUR
 *     Vitrine + reservation + paiement   44 h  x 30 EUR  =  1 320 EUR -> 1 300
 *     Application sur mesure            100 h  x 30 EUR  =  3 000 EUR
 *
 * Le taux de 30 EUR vient d'un calcul par les couts reels - regime micro-BNC,
 * prelevements a 25,8 %, charges annuelles reelles, heures facturables - et il
 * a ete recoupe par un releve de neuf offres francaises comparables. Les 44
 * heures viennent de l'effort MESURE sur le seul projet livre, 331 commits
 * regroupes en seances, corrige de ce que la mesure par commits ne capte pas.
 *
 * Les 100 heures du troisieme palier sont un PLANCHER de perimetre, pas une
 * moyenne : en dessous, ce n'est pas une application metier, c'est un site avec
 * un formulaire. Il est marque « a partir de » pour cette raison.
 *
 * POURQUOI PAS « HT », ET POURQUOI PAS « NETS DE TVA » NON PLUS.
 *
 * En franchise en base, il n'y a pas de TVA a ajouter : le prix affiche EST le
 * total du. « HT » suggere une taxe a venir, ce que l'article 1er de l'arrete
 * du 3 decembre 1987 interdit puisqu'il impose la somme totale effectivement
 * payee. « Nets de TVA » avait d'abord ete ecrit, et c'etait pire : dans
 * l'usage commercial, cela signifie DEDUCTION FAITE de la TVA, donc l'inverse.
 * Le champ `mention_prix` porte desormais la qualification en clair.
 *
 * POURQUOI `hors_forfait` EXISTE.
 *
 * Article 3 du meme arrete : lorsque le prix annonce ne comprend pas un element
 * INDISPENSABLE a la finalite du service, cette particularite doit etre
 * indiquee explicitement. Un nom de domaine et un hebergement sont
 * indispensables a un site en ligne.
 *
 * LES DEUX REGLES SYMETRIQUES, et il faut les deux.
 *
 * Si un devis passe un jour SOUS un plancher affiche, c'est la page qu'on
 * corrige, pas une exception qu'on s'accorde.
 *
 * Si un devis DEPASSE le plancher pour un perimetre que `couvre` decrit, alors
 * c'est le plancher qui est faux. L'article L121-4 repute trompeuse en toutes
 * circonstances la pratique consistant a annoncer un prix sans pouvoir fournir
 * a ce prix. Le calcul de couts et le releve des offres comparables qui fondent
 * ces montants sont conserves : l'article L111-5 fait peser la preuve sur le
 * professionnel, pas sur le client.
 */
export type Fourchette = {
  /** Doit correspondre au slug d'une offre de content/offres.ts. */
  offre: string;
  /**
   * Nom du palier. Deux paliers peuvent partager une meme offre - la vitrine
   * seche et la vitrine equipee relevent toutes deux de `sites-web` - et sans
   * ce champ ils s'afficheraient sous le meme titre.
   */
  nom: string;
  /** Une phrase qui dit a qui ce palier s'adresse. */
  pour_qui: string;
  /** Plancher affiche, par exemple "a partir de 2 500 EUR". */
  plancher: string;
  /**
   * Qualification du prix, exigee par l'article 1er de l'arrete du 3 decembre
   * 1987 : le visiteur doit savoir que rien ne s'ajoute au montant affiche.
   */
  mention_prix: string;
  /** Ce que ce plancher couvre, en une phrase. */
  couvre: string;
  /** Ce que le palier comprend, point par point. */
  inclus: string[];
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
 * Unite de facturation publiee.
 *
 * C'est un TAUX HORAIRE et non un taux journalier, deliberement. Un taux
 * journalier invite le client a convertir en journees ouvrees, et le studio ne
 * travaille pas en journees : annoncer « cinq jours » pour ce qui prend cinq
 * semaines calendaires serait un mensonge sur le calendrier, pas sur le prix.
 */
export const TAUX_HORAIRE = "30 €";

const MENTION_PRIX =
  "Prix total à payer. TVA non applicable, article 293 B du Code général des impôts : aucune taxe ne s'ajoute à ce montant, et il n'ouvre droit à aucune déduction de TVA.";

const HORS_FORFAIT =
  "Ne sont pas compris, alors qu'ils sont nécessaires pour qu'un site soit en ligne : le nom de domaine, son renouvellement annuel et l'hébergement. S'y ajoutent, si vous les demandez : la rédaction des contenus, l'identité visuelle, la reprise d'un site existant, le référencement éditorial, la formation à l'édition et la maintenance. Chacun fait l'objet d'une ligne chiffrée au devis, jamais d'un supplément découvert à la fin.";

const DATE_EFFET =
  "Prix en vigueur au 26 août 2026. Seul le devis signé fixe le prix, le périmètre et le calendrier.";

export const FOURCHETTES: Fourchette[] = [
  {
    offre: "sites-web",
    nom: "Site de présentation",
    pour_qui:
      "Vous voulez exister en ligne, être trouvé, et qu'on puisse vous joindre.",
    plancher: "à partir de 600 €",
    mention_prix: MENTION_PRIX,
    couvre:
      "Un site complet, lisible sur téléphone comme sur écran large, conforme dès la mise en ligne. Le code écrit pour votre projet vous est cédé au paiement intégral.",
    inclus: [
      "Maquette validée avant la première ligne de code",
      "Jusqu'à cinq pages, formulaire de contact compris",
      "Mentions légales, politique de confidentialité, bandeau de consentement",
      "Référencement technique et données structurées",
      "Le code vous appartient, sans abonnement à BLF Lab's",
    ],
    fait_monter:
      "Le nombre d'écrans réellement différents, la reprise d'un site existant, et la rédaction des contenus si vous ne les fournissez pas.",
    hors_forfait: HORS_FORFAIT,
    date_effet: DATE_EFFET,
  },
  {
    offre: "sites-web",
    nom: "Site avec réservation et paiement",
    pour_qui:
      "Vos clients doivent pouvoir faire quelque chose, pas seulement vous lire.",
    plancher: "à partir de 1 300 €",
    mention_prix: MENTION_PRIX,
    couvre:
      "Tout le palier précédent, plus ce qu'un visiteur peut accomplir seul : réserver un créneau, payer, suivre son dossier. Et de quoi piloter tout cela sans nous rappeler.",
    inclus: [
      "Tout ce que comprend le site de présentation",
      "Prise de rendez-vous avec gestion des créneaux et rappel automatique",
      "Paiement en ligne sécurisé",
      "Espace d'administration pour éditer vos textes et suivre vos demandes",
      "Emails automatiques de confirmation et de rappel",
    ],
    fait_monter:
      "Un espace personnel pour vos clients, une facturation automatisée, ou des règles de disponibilité complexes.",
    hors_forfait: HORS_FORFAIT,
    date_effet: DATE_EFFET,
  },
  {
    offre: "apps-web",
    nom: "Application sur mesure",
    pour_qui:
      "Votre métier ne rentre pas dans un outil du commerce, et vous le contournez tous les jours.",
    plancher: "à partir de 3 000 €",
    mention_prix: MENTION_PRIX,
    couvre:
      "Un outil construit autour de ce que vous faites déjà, pas l'inverse. Espace client, tableau de bord, automatisation des saisies qui se répètent.",
    inclus: [
      "Cadrage détaillé, chiffré poste par poste avant tout engagement",
      "Espace client avec comptes et droits",
      "Back-office métier conçu sur vos processus réels",
      "Connexions à vos outils existants",
      "Reprise de vos données, et documentation pour qu'un autre puisse reprendre",
    ],
    fait_monter:
      "Le nombre de rôles et de droits, le volume de données à reprendre, et les connexions à des outils qui n'exposent pas d'interface propre.",
    hors_forfait: HORS_FORFAIT,
    date_effet: DATE_EFFET,
  },
];
