import { z } from "zod";
import { OFFRES } from "@/content/offres";

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

export const orderSchema = z.object({
  projectType: z.enum(PROJECT_TYPES, {
    message: "Choisissez un type de projet.",
  }),
  budget: z.enum(BUDGET_RANGES, { message: "Choisissez un budget." }),
  deadline: z.enum(DEADLINES, { message: "Choisissez une echeance." }),

  message: z
    .string()
    .trim()
    .min(30, "Decrivez votre besoin en 30 caracteres au minimum.")
    .max(4000, "Merci de resumer en moins de 4 000 caracteres."),

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
    message: "Votre accord est necessaire pour traiter la demande.",
  }),

  // Piege a robots : un champ invisible que seul un automate remplit. Il doit
  // rester vide. On ne renvoie pas d'erreur explicite pour ne pas renseigner
  // l'attaquant, la route repond simplement un succes factice.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type OrderInput = z.infer<typeof orderSchema>;

/** Champs de l'etape courante, pour valider au fil de l'eau. */
export const STEP_FIELDS = [
  ["projectType", "budget", "deadline"],
  ["message"],
  ["name", "email", "phone", "company", "consent"],
] as const;
