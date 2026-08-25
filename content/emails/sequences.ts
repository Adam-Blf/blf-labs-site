import { SITE } from "@/lib/site";
import { esc } from "@/lib/prospection/gabarit";

/**
 * LE CONTENU DES SEQUENCES D'EMAIL.
 *
 * Il vit ici, en TypeScript, et pas en base. Trois raisons, dans cet ordre :
 *
 *   1. la garde typographique et check:french de l'integration continue lisent
 *      les fichiers du depot, pas les lignes d'une table. Un message ecrit en
 *      base echappe aux deux ;
 *   2. un changement de texte se relit dans une revue de code, avec son avant
 *      et son apres, comme n'importe quel autre changement ;
 *   3. une base ne se restaure pas aussi facilement qu'un fichier.
 *
 * La base ne garde donc qu'un slug de sequence et un numero d'etape.
 *
 * REGLE DE REDACTION, la meme que pour les etudes de cas : rien qui ne soit
 * verifiable. Pas de "des dizaines de clients", pas de gain de conversion, pas
 * de chiffre de frequentation tant que la mesure n'a pas ete faite. Un prospect
 * qui verifie une affirmation fausse ne revient pas.
 *
 * REGLE JURIDIQUE : chaque message porte l'identite complete de l'expediteur et
 * un lien de desinscription. La coquille de lib/prospection/gabarit.ts les
 * ajoute automatiquement, aucun message n'a a y penser.
 */

export type Audience =
  /** Personnes ayant coche la case de prospection. Article 6.1.a du RGPD. */
  | "optin"
  /** Suivi d'une demande de devis. Article 6.1.b, ce n'est pas de la prospection. */
  | "devis"
  /** Adresses generiques de personnes morales. Article L.34-5 du CPCE. */
  | "b2b";

export type VariablesEmail = {
  /** Prenom ou nom si connu. Le gabarit gere l'absence sans laisser de trou. */
  nom: string | null;
  organisation: string | null;
  /** Racine du site, sans barre finale. */
  url: string;
};

export type MessageSequence = {
  slug: string;
  /**
   * Delai depuis l'etape precedente, en heures. Pour la premiere etape, delai
   * depuis l'inscription a la sequence.
   */
  delaiHeures: number;
  sujet: string;
  corps: (v: VariablesEmail) => string;
  /**
   * Statuts de commande dans lesquels cette etape a un sens. Absent : l'etape
   * part quel que soit l'etat du dossier.
   *
   * Sert aux messages qui AFFIRMENT quelque chose sur le dossier. Dire « le
   * devis envoye la semaine derniere » a quelqu'un qui n'a jamais recu de
   * devis est une affirmation fausse, et un prospect qui verifie une
   * affirmation fausse ne revient pas. Le moteur saute l'etape sans l'envoyer.
   */
  siStatutCommande?: string[];
};

export type Sequence = {
  slug: string;
  nom: string;
  audience: Audience;
  /** Ce que la sequence fait, en une phrase, pour le back-office. */
  resume: string;
  messages: MessageSequence[];
};

/**
 * Salutation qui ne laisse pas de trou quand le nom est inconnu.
 *
 * ECHAPPE, comme toute valeur venue d'un formulaire. Le nom arrive de la
 * commande sans autre controle qu'une longueur maximale : un nom contenant un
 * chevron casse le balisage du message, et un nom fabrique y injecte ce qu'il
 * veut. La coquille echappe tout le reste, ce serait absurde de laisser passer
 * la seule valeur reellement fournie par un tiers.
 */
function bonjour(nom: string | null): string {
  return nom ? `Bonjour ${esc(nom)},` : "Bonjour,";
}

function p(texte: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">${texte}</p>`;
}

function bouton(url: string, libelle: string): string {
  return `<p style="margin:24px 0"><a href="${url}" style="display:inline-block;background:#cb6ce6;color:#111016;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700">${libelle}</a></p>`;
}

function signature(): string {
  return `<p style="margin:24px 0 0;font-size:15px;line-height:1.6">Adam Beloucif<br><span style="color:#5b6472">${SITE.brand}, développement de sites et d'applications</span></p>`;
}

// LE CARNET DU STUDIO -------------------------------------------------------
//
// Sequence d'opt-in strict. Elle ne part qu'apres un clic de confirmation, et
// le rythme annonce a l'etape d'accueil est tenu : une promesse de frequence
// non tenue est la premiere cause de plainte pour indesirable.

const CARNET: Sequence = {
  slug: "carnet",
  nom: "Le carnet du studio",
  audience: "optin",
  resume: "Accueil des inscrits, puis une note par mois.",
  messages: [
    {
      slug: "accueil",
      delaiHeures: 0,
      sujet: "Ce que vous allez recevoir",
      corps: (v) =>
        p(bonjour(v.nom)) +
        p(
          "Merci d'avoir confirmé votre inscription au carnet du studio. Voici, sans détour, ce que cela veut dire.",
        ) +
        p(
          "Vous recevrez <strong>un email par mois</strong>, pas davantage. Chaque envoi contient une note écrite en travaillant : un choix technique et ce qu'il a coûté, un projet livré et ce qu'on peut y vérifier, ou un document utilisable tel quel.",
        ) +
        p(
          "Aucune vente déguisée, aucune relance automatique parce que vous avez ouvert un message. Si le rythme ne vous convient plus, le lien en bas de chaque email vous retire de la liste immédiatement.",
        ) +
        p(
          `En attendant la prochaine note, les réalisations du studio sont visibles ici : <a href="${v.url}/references" style="color:#5b5bd6">${SITE.domain}/references</a>.`,
        ) +
        signature(),
    },
    {
      slug: "budget",
      delaiHeures: 96,
      sujet: "Ce qu'un site coûte vraiment",
      corps: (v) =>
        p(bonjour(v.nom)) +
        p(
          "La question qui revient le plus souvent, et à laquelle presque aucune agence ne répond publiquement : combien.",
        ) +
        p(
          "La réponse honnête, c'est que le prix dépend de trois choses, connues avant de commencer : le nombre d'écrans réellement différents, la présence ou non d'un espace connecté, et qui écrit les contenus.",
        ) +
        p(
          "Le studio n'affiche pas de tarif fixe, et ce n'est pas une pudeur commerciale : le périmètre s'ajuste au budget disponible plutôt que l'inverse. Dites ce que vous pouvez y mettre, je dis ce que cela permet de faire, et ce qu'il faut remettre à plus tard.",
        ) +
        bouton(`${v.url}/tarifs`, "Ce qui fait monter un prix") +
        signature(),
    },
    {
      slug: "etude-de-cas",
      delaiHeures: 120,
      sujet: "Un cabinet, un site, trois semaines",
      corps: (v) =>
        p(bonjour(v.nom)) +
        p(
          "Une note sur un projet réel plutôt qu'un discours sur la méthode : le site d'un cabinet d'hypnose, refait de zéro.",
        ) +
        p(
          "Le point de départ, le problème concret à résoudre, ce qui a été choisi et pourquoi, et surtout ce que n'importe qui peut vérifier aujourd'hui en ouvrant le site. Aucun chiffre de performance n'y figure tant que la mesure n'a pas été faite, c'est une règle du studio.",
        ) +
        bouton(`${v.url}/references`, "Lire l'étude de cas") +
        signature(),
    },
    {
      slug: "rendez-vous",
      delaiHeures: 168,
      sujet: "Vingt minutes, sans engagement",
      corps: (v) =>
        p(bonjour(v.nom)) +
        p(
          "Dernier message de cette série d'accueil. Si vous avez un projet en tête, même flou, une conversation de vingt minutes suffit en général à savoir s'il est faisable, à quel budget, et dans quel délai.",
        ) +
        p(
          "C'est gratuit et sans suite obligatoire. Si le projet ne correspond pas à ce que fait le studio, je vous le dis, et je vous oriente vers quelqu'un de plus adapté.",
        ) +
        bouton(`${v.url}/rendez-vous`, "Caler vingt minutes") +
        p(
          "Sinon, rien à faire : vous continuerez à recevoir une note par mois, et rien d'autre.",
        ) +
        signature(),
    },
  ],
};

// LE SUIVI D'UNE DEMANDE DE DEVIS -------------------------------------------
//
// Ce n'est PAS de la prospection : c'est le suivi d'une demande que la personne
// a elle-meme formulee, article 6.1.b du RGPD, mesures precontractuelles. Aucun
// consentement de prospection n'est requis, et c'est pour cela que cette
// sequence est celle qui rapporte le plus tot.
//
// Le moteur arrete la sequence des que la commande passe en gagnee ou perdue :
// relancer quelqu'un qui a signe est le meilleur moyen de le faire douter.

const SUIVI_DEVIS: Sequence = {
  slug: "devis",
  nom: "Suivi d'une demande de devis",
  audience: "devis",
  resume: "Relance une demande restée sans suite, puis referme le dossier.",
  messages: [
    {
      slug: "precision",
      delaiHeures: 48,
      sujet: "Une précision sur votre projet",
      corps: (v) =>
        p(bonjour(v.nom)) +
        p(
          `Votre demande${v.organisation ? ` pour ${esc(v.organisation)}` : ""} est bien arrivée, et je l'ai lue.`,
        ) +
        p(
          "Avant de vous envoyer une estimation qui tienne debout, une seule question : y a-t-il une date à laquelle le site ou l'application doit être en ligne ? Un lancement, un salon, une rentrée. C'est ce qui change le plus le chiffrage, bien plus que le nombre de pages.",
        ) +
        p("Répondez simplement à cet email, deux lignes suffisent.") +
        signature(),
    },
    {
      slug: "relance-devis",
      delaiHeures: 120,
      siStatutCommande: ["devis_envoye"],
      sujet: "Le devis vous convient-il",
      corps: (v) =>
        p(bonjour(v.nom)) +
        p(
          "Je reviens vers vous à propos du devis envoyé la semaine dernière. Sans nouvelle, je ne sais pas si le budget ne va pas, si le périmètre n'est pas le bon, ou si le sujet est simplement passé au second plan.",
        ) +
        p(
          "Les trois cas se traitent. Un périmètre se réduit, un projet se découpe en deux étapes, et un dossier se met en pause sans que le devis expire pour autant. Dites-moi lequel des trois, et je m'adapte.",
        ) +
        signature(),
    },
    {
      slug: "cloture",
      delaiHeures: 336,
      sujet: "Je referme le dossier",
      corps: (v) =>
        p(bonjour(v.nom)) +
        p(
          "Sans retour de votre part, je referme votre dossier pour ne pas vous encombrer. Ce n'est pas un reproche, les projets changent de priorité tout le temps.",
        ) +
        p(
          "Le devis reste valable si vous le ressortez dans les prochaines semaines, et vous pouvez reprendre le fil quand vous voulez en répondant à cet email. C'est mon dernier message sur ce dossier.",
        ) +
        signature(),
    },
  ],
};

// LE PREMIER CONTACT PROFESSIONNEL ------------------------------------------
//
// Voie B2B, article L.34-5 du CPCE, opt-out. Elle ne s'adresse qu'a une adresse
// GENERIQUE d'une personne morale immatriculee, et la base refuse toute autre
// forme (contrainte contacts_b2b_strict de la migration 0012).
//
// DEUX MESSAGES, JAMAIS TROIS. Le plafond n'est pas une consigne de politesse :
// c'est ce qui separe une prise de contact professionnelle d'un harcelement
// commercial, et ce que la CNIL regarde en cas de plainte.
//
// L'origine des donnees figure dans le premier message, au titre de l'article
// 14 du RGPD : l'adresse ne vient pas de la personne, elle doit savoir d'ou
// elle vient.

const PREMIER_CONTACT: Sequence = {
  slug: "premier-contact",
  nom: "Premier contact professionnel",
  audience: "b2b",
  resume: "Deux messages a une adresse generique d'entreprise, puis plus rien.",
  messages: [
    {
      slug: "ouverture",
      delaiHeures: 0,
      sujet: "Votre site et la prise de contact en ligne",
      corps: (v) =>
        p("Bonjour,") +
        p(
          `Je suis Adam Beloucif, développeur indépendant en Île-de-France. Je m'adresse à ${v.organisation ? esc(v.organisation) : "votre établissement"} au sujet d'un point précis, pas pour vous présenter un catalogue.`,
        ) +
        p(
          "Beaucoup de structures de votre taille ont un site qui informe correctement, mais sur lequel un client ne peut rien faire : ni prendre rendez-vous, ni demander un devis, ni payer. Le contact se fait alors par téléphone, aux heures d'ouverture, et ce qui arrive en dehors est perdu.",
        ) +
        p(
          `Si c'est votre cas et que le sujet est d'actualité, le studio fait exactement cela. Les réalisations sont publiques et vérifiables : <a href="${v.url}/references" style="color:#5b5bd6">${SITE.domain}/references</a>.`,
        ) +
        p(
          "Si ce n'est pas d'actualité, le lien en bas de ce message vous retire définitivement de ma liste, en un clic.",
        ) +
        signature() +
        p(
          `<span style="font-size:12px;color:#5b6472">Cette adresse professionnelle a été relevée sur le site public de votre structure ou dans la base SIRENE, base de données ouverte de l'INSEE. Vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition, à exercer à ${SITE.email}.</span>`,
        ),
    },
    {
      slug: "cloture",
      delaiHeures: 120,
      sujet: "Je n'insiste pas",
      corps: (v) =>
        p("Bonjour,") +
        p(
          "Je vous ai écrit il y a quelques jours au sujet de la prise de contact en ligne sur votre site. Sans réponse, je considère que le sujet n'est pas d'actualité, et c'est mon dernier message.",
        ) +
        p(
          `Si la question se pose plus tard, tout est sur <a href="${v.url}" style="color:#5b5bd6">${SITE.domain}</a>, budgets compris. Bonne continuation.`,
        ) +
        signature(),
    },
  ],
};

export const SEQUENCES: Sequence[] = [CARNET, SUIVI_DEVIS, PREMIER_CONTACT];

export function trouveSequence(slug: string): Sequence | undefined {
  return SEQUENCES.find((s) => s.slug === slug);
}

/** Slugs utilises par le moteur et le back-office, pour eviter les chaines nues. */
export const SEQUENCE_CARNET = CARNET.slug;
export const SEQUENCE_DEVIS = SUIVI_DEVIS.slug;
export const SEQUENCE_B2B = PREMIER_CONTACT.slug;
