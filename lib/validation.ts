import { z } from "zod";
import { OFFRES } from "@/content/offres";
import { OPTIONS } from "@/content/options";
import { isSirenOrSiret, isVatNumber } from "@/lib/siren";

/**
 * Schema unique de la demande de commande, partage par le formulaire et par la
 * route d'API.
 *
 * Point de securite : le client peut etre modifie, donc la validation cote
 * navigateur n'est qu'un confort. C'est CE MEME schema, rejoue cote serveur,
 * qui fait foi. Il ne doit jamais exister deux definitions divergentes.
 *
 * Zod 4 : `z.email()` remplace `z.string().email()`, deprecie.
 */

const SLUGS = OFFRES.map((offre) => offre.slug);

export const PROJECT_TYPES = [...SLUGS, "autre"] as const;

export const BUDGET_RANGES = [
  "moins-de-2000",
  "2000-5000",
  "5000-10000",
  "plus-de-10000",
  "a-definir",
] as const;

export const DEADLINES = [
  "des-que-possible",
  "sous-1-mois",
  "sous-3-mois",
  "pas-presse",
] as const;

/**
 * Libelles affiches. Les valeurs stockees restent des identifiants stables.
 *
 * ATTENTION - ces chaines sont vues par le client A DEUX ENDROITS : les listes
 * de l'etape 2 du tunnel (components/order/OrderForm.tsx) et le recapitulatif
 * des emails (lib/mail.ts). Une faute ici se lit deux fois.
 *
 * Elles ont porte « 2 000 a 5 000 », « A definir » et « Des que possible »
 * jusqu'au 25/08/2026, sans que `check:french` proteste. Ce n'est pas un defaut
 * de la garde : son dictionnaire ecarte deliberement « a », « des » et « ou »,
 * qui sont aussi des mots corrects. Elargir le dictionnaire a ces mots-la
 * casserait du texte juste ailleurs. La relecture reste donc humaine sur ces
 * trois mots, et c'est le bon arbitrage.
 */
export const BUDGET_LABELS: Record<(typeof BUDGET_RANGES)[number], string> = {
  "moins-de-2000": "Moins de 2 000 euros",
  "2000-5000": "2 000 à 5 000 euros",
  "5000-10000": "5 000 à 10 000 euros",
  "plus-de-10000": "Plus de 10 000 euros",
  "a-definir": "À définir ensemble",
};

export const DEADLINE_LABELS: Record<(typeof DEADLINES)[number], string> = {
  "des-que-possible": "Dès que possible",
  "sous-1-mois": "Sous un mois",
  "sous-3-mois": "Sous trois mois",
  "pas-presse": "Pas de date imposée",
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  ...Object.fromEntries(OFFRES.map((offre) => [offre.slug, offre.title])),
  autre: "Autre besoin",
};

export const CUSTOMER_TYPES = ["particulier", "entreprise"] as const;

export const CUSTOMER_TYPE_LABELS: Record<
  (typeof CUSTOMER_TYPES)[number],
  string
> = {
  particulier: "Un particulier",
  entreprise: "Une entreprise ou une association",
};

/**
 * Champs de facturation, TOUS FACULTATIFS a la prise de contact.
 *
 * Ils restent dans le schema parce qu'un professionnel qui les a sous la main
 * fait gagner un aller-retour, et parce qu'un appel d'API peut les fournir. Ce
 * qui a change, c'est qu'aucun n'est exige pour envoyer une demande : ils sont
 * reclames a l'emission de la piece comptable, la ou la loi les impose
 * vraiment.
 */
const billingFields = {
  companyName: z.string().trim().max(200).optional(),
  siren: z.string().trim().max(20).optional(),
  vatNumber: z.string().trim().max(20).optional(),
  billingStreet: z.string().trim().max(200).optional(),
  billingPostalCode: z.string().trim().max(20).optional(),
  billingCity: z.string().trim().max(120).optional(),
  billingCountry: z.string().trim().max(80).optional(),
};

export const orderSchema = z.object({
  customerType: z.enum(CUSTOMER_TYPES, {
    message: "Precisez si vous commandez a titre personnel ou professionnel.",
  }),
  ...billingFields,
  projectType: z.enum(PROJECT_TYPES, {
    message: "Choisissez un type de projet.",
  }),
  budget: z.enum(BUDGET_RANGES, { message: "Choisissez un budget." }),
  deadline: z.enum(DEADLINES, { message: "Choisissez une échéance." }),

  /**
   * Prestations complementaires cochees. Toutes facultatives : un client peut
   * ne vouloir que le developpement. La liste des valeurs acceptees vient de
   * content/options.ts, donc ajouter une prestation la-bas suffit.
   */
  options: z
    .array(z.enum(OPTIONS.map((option) => option.slug) as [string, ...string[]]))
    .optional()
    .default([]),

  message: z
    .string()
    .trim()
    .min(30, "Décrivez votre besoin en 30 caractères au minimum.")
    .max(4000, "Merci de résumer en moins de 4 000 caractères."),

  name: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom.")
    .max(120, "Nom trop long."),

  email: z.email("Adresse email invalide.").max(200),

  // Optionnels : on accepte la chaine vide depuis le formulaire et on la
  // transforme en absence de valeur, plutot que de stocker "" en base.
  phone: z
    .string()
    .trim()
    .max(30, "Numero trop long.")
    .optional()
    .transform((value) => (value ? value : undefined)),

  company: z
    .string()
    .trim()
    .max(160, "Nom d'organisation trop long.")
    .optional()
    .transform((value) => (value ? value : undefined)),

  // Consentement explicite, jamais pre-coche cote interface.
  consent: z.literal(true, {
    message: "Votre accord est nécessaire pour traiter la demande.",
  }),

  /**
   * Consentement a la prospection commerciale. RIEN A VOIR avec le precedent,
   * et c'est tout l'enjeu.
   *
   * `consent` couvre l'article 6.1.b du RGPD, les mesures precontractuelles
   * prises a la demande de la personne. Il est obligatoire, d'ou le
   * `z.literal(true)` : sans lui, il n'y a pas de demande a traiter.
   *
   * `prospectionConsent` couvre l'article 6.1.a, le consentement. Il est
   * FACULTATIF, d'ou le `z.boolean()`. Un consentement dont le refus
   * empecherait d'obtenir le service ne serait pas libre au sens de l'article
   * 7.4, donc nul. La difference entre les deux types Zod n'est pas un detail
   * de style : c'est la difference entre une option et une condition.
   */
  prospectionConsent: z.boolean().optional().default(false),

  // Piege a robots : un champ invisible que seul un automate remplit.
  //
  // Le schema l'ACCEPTE, quelle que soit sa valeur, et c'est delibere. La
  // version precedente imposait `max(0)`, ce qui faisait echouer la validation
  // : la route repondait alors 400 « Formulaire invalide » et son garde-fou
  // `if (order.website) return ok:true`, ecrit precisement pour ne rien
  // apprendre a l'automate, n'etait jamais atteint. Le piege fonctionnait, mais
  // il annoncait a l'automate qu'il avait ete repere, ce qui est exactement ce
  // qu'on voulait eviter. Le tri se fait donc dans la route, pas ici.
  website: z.string().optional(),
});

/**
 * CE QUI EST EXIGE D'UN PROFESSIONNEL, ET CE QUI NE L'EST PLUS.
 *
 * La version precedente reclamait raison sociale, SIREN et adresse de
 * facturation complete AVANT tout engagement, sur un formulaire de PRISE DE
 * CONTACT. C'etait un formulaire de facturation deguise, et la friction la plus
 * couteuse du site : personne ne va chercher son numero SIREN pour demander un
 * devis qu'il n'a pas encore vu.
 *
 * Ces informations sont desormais demandees LA OU ELLES SERVENT, a l'emission
 * du devis ou de la facture. La garde n'a pas disparu, elle a bouge : voir
 * `issueInvoice` dans app/admin/actions-facturation.ts, qui refuse d'emettre a
 * un professionnel sans SIREN valide. Une piece legale ne peut toujours pas
 * partir incomplete.
 *
 * Ce qui reste verifie ici : le FORMAT, quand la valeur est fournie. Un SIREN
 * faux saisi spontanement doit etre signale tout de suite, pas trois semaines
 * plus tard sur une facture.
 */
export const orderSchemaChecked = orderSchema.superRefine((data, ctx) => {
  if (data.customerType !== "entreprise") return;

  if (data.siren && !isSirenOrSiret(data.siren)) {
    ctx.addIssue({
      code: "custom",
      path: ["siren"],
      message:
        "Ce numero est invalide : un SIREN compte 9 chiffres, un SIRET 14, et la cle de controle doit tomber juste.",
    });
  }

  // La TVA reste facultative : une association non assujettie ou une
  // micro-entreprise en franchise n'en a pas.
  if (data.vatNumber && !isVatNumber(data.vatNumber)) {
    ctx.addIssue({
      code: "custom",
      path: ["vatNumber"],
      message: "Numero de TVA intracommunautaire invalide (format attendu : FR12345678901).",
    });
  }
});

export type OrderInput = z.infer<typeof orderSchema>;

/** Champs de l'etape courante, pour valider au fil de l'eau. */
export const STEP_FIELDS = [
  ["projectType"],
  ["budget"],
  ["deadline", "options"],
  ["message"],
  [
    "customerType",
    "name",
    "email",
    "phone",
    "company",
    "companyName",
    "siren",
    "consent",
    "prospectionConsent",
  ],
] as const;
