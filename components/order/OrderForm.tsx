"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox, RadioCards, TextArea, TextField } from "./fields";
import { WizardSteps, type WizardStep } from "@/components/ui/WizardSteps";
import {
  BUDGET_LABELS,
  BUDGET_RANGES,
  CUSTOMER_TYPES,
  CUSTOMER_TYPE_LABELS,
  DEADLINES,
  DEADLINE_LABELS,
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  STEP_FIELDS,
  orderSchemaChecked,
} from "@/lib/validation";

type Values = {
  projectType: string;
  budget: string;
  deadline: string;
  message: string;
  customerType: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  companyName: string;
  siren: string;
  vatNumber: string;
  billingStreet: string;
  billingPostalCode: string;
  billingCity: string;
  billingCountry: string;
  consent: boolean;
  website: string;
};

const EMPTY: Values = {
  projectType: "",
  budget: "",
  deadline: "",
  message: "",
  customerType: "",
  name: "",
  email: "",
  phone: "",
  company: "",
  companyName: "",
  siren: "",
  vatNumber: "",
  billingStreet: "",
  billingPostalCode: "",
  billingCity: "",
  // Pre-rempli parce que la quasi-totalite des clients sont francais : c'est
  // un gain de saisie, pas une contrainte, le champ reste modifiable.
  billingCountry: "France",
  consent: false,
  website: "",
};

/**
 * Formulaire de commande en trois etapes.
 *
 * La validation utilise le MEME schema Zod que la route d'API : les messages
 * affiches ici sont donc exactement ceux que le serveur appliquerait. Valider
 * etape par etape evite de presenter d'un coup une page rouge d'erreurs.
 *
 * `defaultOffre` pre-selectionne la famille de projet quand on arrive depuis une
 * page d'offre, pour ne pas faire ressaisir ce que le visiteur vient de choisir.
 */
export function OrderForm({ defaultOffre = "" }: { defaultOffre?: string }) {
  const [values, setValues] = useState<Values>({
    ...EMPTY,
    projectType: PROJECT_TYPES.includes(defaultOffre as never) ? defaultOffre : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  /** Valide les champs d'une etape. Rend vrai si l'etape est complete. */
  function validateStep(stepIndex: number): boolean {
    const parsed = orderSchemaChecked.safeParse(values);
    if (parsed.success) return true;

    const fields = STEP_FIELDS[stepIndex] ?? [];
    const stepErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (fields.includes(key as never) && !stepErrors[key]) {
        stepErrors[key] = issue.message;
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  async function submit() {
    if (!validateStep(2)) return;

    setSubmitting(true);
    setGlobalError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (body.fieldErrors) setErrors(body.fieldErrors);
        setGlobalError(
          body.error ?? "L'envoi a echoue. Reessayez dans un instant.",
        );
        return;
      }

      setSent(true);
    } catch {
      // Panne reseau : on donne une porte de sortie plutot qu'un message vide.
      setGlobalError(
        "Impossible de joindre le serveur. Verifiez votre connexion, ou ecrivez directement a adam@beloucif.com.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="blk bg-surface p-8 text-center">
        <h2 className="title text-2xl">Demande envoyee</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Un accuse de reception vient de partir vers {values.email}. Vous
          recevrez une reponse avec une estimation de budget et de delai.
        </p>
        <Link
          href="/"
          className="blk-sm title mt-8 inline-block min-h-[44px] bg-accent px-6 py-3 text-accent-ink"
        >
          Revenir a l&rsquo;accueil
        </Link>
      </div>
    );
  }

  const steps: WizardStep[] = [
    {
      id: "projet",
      label: "Votre projet",
      content: (
        <div className="space-y-8">
          <RadioCards
            name="projectType"
            legend="De quel type de projet s'agit-il ?"
            value={values.projectType as never}
            onChange={(value) => set("projectType", value)}
            error={errors.projectType}
            options={PROJECT_TYPES.map((type) => ({
              value: type,
              label: PROJECT_TYPE_LABELS[type] ?? type,
            }))}
          />

          <RadioCards
            name="budget"
            legend="Quel budget avez-vous en tete ?"
            value={values.budget as never}
            onChange={(value) => set("budget", value)}
            error={errors.budget}
            options={BUDGET_RANGES.map((range) => ({
              value: range,
              label: BUDGET_LABELS[range],
            }))}
          />

          <RadioCards
            name="deadline"
            legend="Pour quand ?"
            value={values.deadline as never}
            onChange={(value) => set("deadline", value)}
            error={errors.deadline}
            options={DEADLINES.map((deadline) => ({
              value: deadline,
              label: DEADLINE_LABELS[deadline],
            }))}
          />
        </div>
      ),
    },
    {
      id: "besoin",
      label: "Votre besoin",
      content: (
        <TextArea
          id="message"
          label="Decrivez ce que vous voulez obtenir"
          hint="Le contexte, le probleme a resoudre, et ce a quoi vous verrez que c'est reussi. Pas besoin de vocabulaire technique."
          value={values.message}
          onChange={(value) => set("message", value)}
          error={errors.message}
        />
      ),
    },
    {
      id: "contact",
      label: "Vous joindre",
      content: (
        <div className="space-y-8">
          <RadioCards
            name="customerType"
            legend="Vous commandez en tant que"
            value={values.customerType as never}
            onChange={(value) => set("customerType", value)}
            error={errors.customerType}
            options={CUSTOMER_TYPES.map((type) => ({
              value: type,
              label: CUSTOMER_TYPE_LABELS[type],
              hint:
                type === "entreprise"
                  ? "Quelques informations de facturation en plus, exigees sur une facture professionnelle."
                  : undefined,
            }))}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id="name"
              label="Nom"
              value={values.name}
              onChange={(value) => set("name", value)}
              error={errors.name}
              autoComplete="name"
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) => set("email", value)}
              error={errors.email}
              autoComplete="email"
            />
            <TextField
              id="phone"
              label="Telephone"
              type="tel"
              optional
              value={values.phone}
              onChange={(value) => set("phone", value)}
              error={errors.phone}
              autoComplete="tel"
            />
            <TextField
              id="company"
              label="Organisation"
              optional
              value={values.company}
              onChange={(value) => set("company", value)}
              error={errors.company}
              autoComplete="organization"
            />
          </div>

          {/* Bloc de facturation, affiche uniquement pour un professionnel.
              Ces champs sont ceux qu'une facture entre professionnels doit
              porter, et que le format de facture electronique exige : sans eux,
              la facture ne peut pas etre emise correctement. */}
          {values.customerType === "entreprise" && (
            <fieldset className="blk-flat bg-surface p-6">
              <legend className="title px-2 text-lg">
                Informations de facturation
              </legend>
              <p className="mt-2 text-sm text-muted">
                Obligatoires sur une facture professionnelle. Elles ne servent
                qu&rsquo;a etablir le devis puis la facture.
              </p>

              <div className="mt-6 space-y-6">
                <TextField
                  id="companyName"
                  label="Raison sociale"
                  value={values.companyName}
                  onChange={(value) => set("companyName", value)}
                  error={errors.companyName}
                  autoComplete="organization"
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="siren"
                    label="SIREN ou SIRET"
                    placeholder="123 456 789"
                    value={values.siren}
                    onChange={(value) => set("siren", value)}
                    error={errors.siren}
                  />
                  <TextField
                    id="vatNumber"
                    label="TVA intracommunautaire"
                    placeholder="FR12345678901"
                    optional
                    value={values.vatNumber}
                    onChange={(value) => set("vatNumber", value)}
                    error={errors.vatNumber}
                  />
                </div>

                <TextField
                  id="billingStreet"
                  label="Adresse de facturation"
                  value={values.billingStreet}
                  onChange={(value) => set("billingStreet", value)}
                  error={errors.billingStreet}
                  autoComplete="street-address"
                />

                <div className="grid gap-6 sm:grid-cols-3">
                  <TextField
                    id="billingPostalCode"
                    label="Code postal"
                    value={values.billingPostalCode}
                    onChange={(value) => set("billingPostalCode", value)}
                    error={errors.billingPostalCode}
                    autoComplete="postal-code"
                  />
                  <TextField
                    id="billingCity"
                    label="Ville"
                    value={values.billingCity}
                    onChange={(value) => set("billingCity", value)}
                    error={errors.billingCity}
                    autoComplete="address-level2"
                  />
                  <TextField
                    id="billingCountry"
                    label="Pays"
                    value={values.billingCountry}
                    onChange={(value) => set("billingCountry", value)}
                    error={errors.billingCountry}
                    autoComplete="country-name"
                  />
                </div>
              </div>
            </fieldset>
          )}

          {/* Piege a robots : hors flux, masque aux lecteurs d'ecran et exclu
              de la tabulation. Un humain ne peut pas le remplir. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-0">
            <label htmlFor="website">Ne pas remplir</label>
            <input
              id="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(event) => set("website", event.target.value)}
            />
          </div>

          <Checkbox
            id="consent"
            checked={values.consent}
            onChange={(checked) => set("consent", checked)}
            error={errors.consent}
          >
            J&rsquo;accepte que ces informations soient utilisees pour repondre a
            ma demande. Elles ne sont ni revendues ni utilisees pour de la
            prospection. Voir la{" "}
            <Link href="/legal/confidentialite" className="underline">
              politique de confidentialite
            </Link>
            .
          </Checkbox>
        </div>
      ),
    },
  ];

  return (
    <div>
      <WizardSteps
        steps={steps}
        submitting={submitting}
        onBeforeNext={validateStep}
        onComplete={submit}
      />

      {globalError && (
        <p role="alert" className="blk-sm mt-6 bg-support p-4 text-support-ink">
          {globalError}
        </p>
      )}
    </div>
  );
}
