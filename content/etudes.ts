/**
 * Etudes de cas detaillees, une par realisation.
 *
 * REGLE DE REDACTION, non negociable : tout ce qui est ecrit ici doit etre
 * verifiable par quelqu'un qui ouvre le site livre ou le depot. Pas de chiffre
 * de frequentation, pas de gain de conversion, pas de "x fois plus rapide"
 * tant que la mesure n'existe pas et n'a pas ete faite.
 *
 * C'est une contrainte commerciale autant qu'une question d'honnetete : un
 * prospect qui verifie une affirmation fausse ne revient pas, et une etude de
 * cas est justement lue par ceux qui verifient.
 *
 * Le champ `chiffres` porte des mesures REELLEMENT PRISES, jamais une
 * estimation. Chaque valeur nomme sa methode et sa date dans `source`, pour que
 * n'importe qui puisse la refaire et obtenir le meme ordre de grandeur.
 *
 * Ce qui n'y figure toujours pas, faute de mesure : la frequentation et le taux
 * de prise de contact. Ils viendront quand la mesure d'audience sera branchee,
 * pas avant. Un chiffre d'affluence invente se verifie en une requete.
 */
export type Chiffre = {
  /** La valeur, telle qu'elle sera affichee. */
  valeur: string;
  /** Ce qu'elle mesure, en une ligne. */
  libelle: string;
  /** D'ou vient la mesure. Sans source, pas de chiffre. */
  source: string;
};

export type Etude = {
  /** Doit correspondre au slug de la reference dans content/references.ts. */
  slug: string;
  /** Le contexte, en une phrase : qui, et quel etait le point de depart. */
  contexte: string;
  /** Le probleme concret a resoudre, sans jargon. */
  probleme: string[];
  /** Ce qui a ete fait, et surtout pourquoi ce choix plutot qu'un autre. */
  reponse: Array<{ titre: string; detail: string }>;
  /** Ce qui est verifiable aujourd'hui par n'importe qui. */
  verifiable: string[];
  /** Mesures chiffrees. Vide tant qu'aucune mesure reelle n'existe. */
  chiffres: Chiffre[];
};

export const ETUDES: Etude[] = [
  {
    slug: "bacchana",
    contexte:
      "Bacchana est un jeu de soirée conçu, développé et édité par le studio. C'est un produit maison, pas une commande : il sert aussi de banc d'essai pour les choix techniques proposés ensuite aux clients.",
    probleme: [
      "Un jeu de soirée se joue à plusieurs, sur les téléphones qui sont là. Imposer une installation depuis un magasin d'applications, à cinq personnes, un vendredi soir, revient à ne pas être joué.",
      "Mais une application web seule se ferme et s'oublie. Il fallait donc les deux : accessible en un lien, et installable pour ceux qui reviennent.",
    ],
    reponse: [
      {
        titre: "Une base commune, trois plateformes",
        detail:
          "Une application web installable, plus une version iOS et une version Android construites à parité. Le jeu s'ouvre en un lien pour la personne qui découvre, et s'installe pour celle qui revient. Le code de jeu est partagé : une règle corrigée l'est partout, pas trois fois.",
      },
      {
        titre: "Le paiement avant l'audience",
        detail:
          "Les achats intégrés ont été branchés avant la mesure d'audience, volontairement. Un produit qui ne sait pas encaisser n'a pas besoin de statistiques, l'inverse est faux.",
      },
      {
        titre: "La mesure derrière le consentement",
        detail:
          "L'audience est mesurée, mais uniquement après accord explicite. Sur un produit grand public destiné à un usage festif, la tentation de tout tracer est forte et le risque réglementaire l'est autant.",
      },
      {
        titre: "Le suivi des erreurs dès la première version",
        detail:
          "Un tableau de bord produit et un suivi des erreurs sont en place. Sur un jeu utilisé en soirée, personne ne signale un bug : il faut le voir soi-même, sinon on ne l'apprend jamais.",
      },
    ],
    verifiable: [
      "Le jeu est en ligne et jouable sans installation.",
      "Les trois plateformes sont maintenues en parallèle, depuis la même base.",
      "La mesure d'audience ne se déclenche qu'après acceptation.",
    ],
    chiffres: [
      {
        valeur: "335 Ko",
        libelle:
          "Ce que le navigateur télécharge pour afficher le jeu, feuilles de style et scripts compris",
        source:
          "Somme des transferts compressés du document et des cinq fichiers d'assets, relevée avec curl --compressed le 25 août 2026.",
      },
      {
        valeur: "0,08 s",
        libelle: "Délai avant le premier octet servi",
        source:
          "Médiane de sept mesures curl depuis une connexion grand public en Île-de-France, le 25 août 2026.",
      },
    ],
  },
  {
    slug: "ohypnozen",
    contexte:
      "Ohypnozen est le cabinet de Nawel Beloucif, praticienne en thérapie humaniste intégrative à Paris. Le besoin : un site qui présente la pratique, permette de prendre rendez-vous, et que la praticienne puisse faire vivre elle-même.",
    probleme: [
      "Un site de cabinet qui ne peut pas être modifié par la praticienne devient faux en quelques mois : les tarifs bougent, les horaires changent, un texte ne convient plus.",
      "Et sur une activité de soin, le cadre juridique n'est pas une formalité de fin de projet : mentions, consentement, conservation des données doivent tenir dès la mise en ligne.",
    ],
    reponse: [
      {
        titre: "Une édition en place, pas une interface d'administration",
        detail:
          "Les textes se modifient directement sur la page, connectée, à l'endroit où ils s'affichent. Une interface d'administration séparée oblige à deviner le rendu final, et c'est ce qui fait qu'on n'y retourne pas.",
      },
      {
        titre: "La conformité livrée avec le site",
        detail:
          "Mentions légales, politique de confidentialité, CGV et consentement à la mesure d'audience sont en place dès la première mise en ligne, pas ajoutés après coup.",
      },
      {
        titre: "La prise de rendez-vous de bout en bout",
        detail:
          "Créneaux, réservation, paiement et accusé de réception. La demande est enregistrée en base avant l'envoi de l'email : une panne du service d'envoi ne peut pas faire perdre un rendez-vous.",
      },
      {
        titre: "Le domaine et l'hébergement au nom du cabinet",
        detail:
          "Nom de domaine et hébergement sont ouverts au nom de la praticienne. Elle peut changer de prestataire sans rien demander à personne, ce qui est la seule garantie qui vaille.",
      },
    ],
    verifiable: [
      "Le site est en ligne et la prise de rendez-vous fonctionne.",
      "Les pages légales sont accessibles depuis le pied de page.",
      "La praticienne modifie ses textes elle-même, sans intervention du studio.",
    ],
    chiffres: [
      {
        valeur: "22 Ko",
        libelle: "Poids du document de la page d'accueil, une fois compressé",
        source:
          "Relevé avec curl --compressed le 25 août 2026. La page est rendue côté serveur, elle s'affiche donc sans attendre le moindre script.",
      },
      {
        valeur: "0,08 s",
        libelle: "Délai avant le premier octet servi",
        source:
          "Médiane de sept mesures curl depuis une connexion grand public en Île-de-France, le 25 août 2026.",
      },
    ],
  },
];

export const ETUDE_PAR_SLUG = new Map(ETUDES.map((etude) => [etude.slug, etude]));
