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

/** Libelles affiches. Les valeurs stockees restent des identifiants stables. */
export const BUDGET_LABELS: Record<(typeof BUDGET_RANGES)[number], string> = {
  "moins-de-2000": "Moins de 2 000 euros",
  "2000-5000": "2 000 a 5 000 euros",
  "5000-10000": "5 000 a 10 000 euros",
  "plus-de-10000": "Plus de 10 000 euros",
  "a-definir": "A definir ensemble",
};

export const DEADLINE_LABELS: Record<(typeof DEADLINES)[number], string> = {
  "des-que-possible": "Des que possible",
  "sous-1-mois": "Sous un mois",
  "sous-3-mois": "Sous trois mois",
  "pas-presse": "Pas de date imposee",
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
 * Champs de facturation exiges d'un client professionnel.
 *
 * Ils ne sont pas du confort : une facture entre professionnels doit porter
 * l'identite complete de l'acheteur, et le format de facture electronique
 * impose son numero SIREN. Les demander au moment de la commande evite de
 * courir apres au moment d'encaisser.
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

  // Piege a robots : un champ invisible que seul un automate remplit. Il doit
  // rester vide. On ne renvoie pas d'erreur explicite pour ne pas renseigner
  // l'attaquant, la route repond simplement un succes factice.
  website: z.string().max(0).optional().or(z.literal("")),
});

/**
 * Les exigences de facturation ne s'appliquent qu'aux professionnels : imposer
 * un SIREN a un particulier serait absurde, et l'omettre pour une entreprise
 * rendrait la facture non conforme. D'ou une validation conditionnelle plutot
 * que deux schemas separes, qui divergeraient a la premiere retouche.
 */
export const orderSchemaChecked = orderSchema.superRefine((data, ctx) => {
  if (data.customerType !== "entreprise") return;

  const required: [keyof typeof data, string][] = [
    ["companyName", "Indiquez la raison sociale."],
    ["billingStreet", "Indiquez l'adresse de facturation."],
    ["billingPostalCode", "Indiquez le code postal."],
    ["billingCity", "Indiquez la ville."],
    ["billingCountry", "Indiquez le pays."],
  ];

  for (const [field, message] of required) {
    if (!data[field]) {
      ctx.addIssue({ code: "custom", path: [field], message });
    }
  }

  if (!data.siren) {
    ctx.addIssue({
      code: "custom",
      path: ["siren"],
      message: "Le SIREN ou le SIRET est obligatoire pour facturer une entreprise.",
    });
  } else if (!isSirenOrSiret(data.siren)) {
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
    "vatNumber",
    "billingStreet",
    "billingPostalCode",
    "billingCity",
    "billingCountry",
    "consent",
  ],
] as const;
