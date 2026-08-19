"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox, CheckboxCards, RadioCards, TextArea, TextField } from "./fields";
import { OPTIONS, OPTION_GROUPS } from "@/content/options";
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
  options: string[];
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
  options: [],
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
 * Formulaire de commande guide, une question par etape.
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
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Une erreur globale (echec reseau ou serveur) doit etre vue : on y amene le
  // focus et on la fait defiler a l'ecran, sinon elle reste sous le bouton, hors
  // champ de vision.
  useEffect(() => {
    if (globalError && errorRef.current) {
      errorRef.current.focus();
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [globalError]);

  /** Amene le focus et l'ecran sur un champ, par son id ou son name. */
  function focusField(key: string) {
    if (typeof document === "undefined") return;
    const el = (document.getElementById(key) ??
      document.querySelector(`[name="${key}"]`)) as HTMLElement | null;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

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
    // Sur echec, on amene le focus sur le premier champ invalide, dans l'ordre
    // de l'etape (pas l'ordre arbitraire de l'objet d'erreurs).
    const firstInvalid = fields.find((field) => stepErrors[String(field)]);
    if (firstInvalid) {
      requestAnimationFrame(() => focusField(String(firstInvalid)));
    }
    return Object.keys(stepErrors).length === 0;
  }

  /**
   * Validation d'un seul champ, au blur, pour les formats (email, SIREN, TVA).
   * Ne touche que ce champ : l'utilisateur voit son erreur de format tout de
   * suite, sans le mur d'erreurs que produirait une validation globale.
   */
  function validateField(key: keyof Values) {
    const parsed = orderSchemaChecked.safeParse(values);
    const issue = parsed.success
      ? undefined
      : parsed.error.issues.find((i) => String(i.path[0]) === key);
    setErrors((current) => {
      const next = { ...current };
      if (issue) next[key as string] = issue.message;
      else delete next[key as string];
      return next;
    });
  }

  async function submit() {
    if (!validateStep(STEP_FIELDS.length - 1)) return;

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
          body.error ?? "L'envoi a échoué. Réessayez dans un instant.",
        );
        return;
      }

      // Redirection vers une adresse dediee plutot qu'un simple changement
      // d'etat : c'est la seule facon de compter les demandes envoyees, et le
      // bouton retour ramene alors sur un formulaire vierge au lieu d'un
      // formulaire deja envoye qui invite a le renvoyer.
      router.push("/commander/merci");
    } catch {
      // Panne reseau : on donne une porte de sortie plutot qu'un message vide.
      setGlobalError(
        "Impossible de joindre le serveur. Vérifiez votre connexion, ou écrivez directement à adam@beloucif.com.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const steps: WizardStep[] = [
    {
      id: "type",
      label: "Type de projet",
      content: (
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
      ),
    },
    {
      id: "budget",
      label: "Budget",
      content: (
        <RadioCards
          name="budget"
          legend="Quel budget avez-vous en tête ?"
          value={values.budget as never}
          onChange={(value) => set("budget", value)}
          error={errors.budget}
          options={BUDGET_RANGES.map((range) => ({
            value: range,
            label: BUDGET_LABELS[range],
          }))}
        />
      ),
    },
    {
      id: "delai",
      label: "Délai et options",
      content: (
        <div className="space-y-6">
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

          <div>
            <p className="text-sm font-medium">
              Avez-vous besoin de ces prestations ?
            </p>
            <p className="mt-1 text-sm font-light text-muted">
              Facultatif. Elles sont chiffrées séparément dans la réponse.
            </p>

            <div className="mt-6 space-y-6">
              {OPTION_GROUPS.map((group) => (
                <CheckboxCards
                  key={group}
                  legend={group}
                  values={values.options}
                  onToggle={(value, checked) =>
                    set(
                      "options",
                      checked
                        ? [...values.options, value]
                        : values.options.filter((item) => item !== value),
                    )
                  }
                  options={OPTIONS.filter((option) => option.group === group).map(
                    (option) => ({
                      value: option.slug,
                      label: option.label,
                      hint: option.detail,
                    }),
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "besoin",
      label: "Votre besoin",
      content: (
        <TextArea
          id="message"
          label="Décrivez ce que vous voulez obtenir"
          hint="Le contexte, le problème à résoudre, et ce à quoi vous verrez que c'est réussi. Pas besoin de vocabulaire technique."
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
        <div className="space-y-6">
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
                  ? "Quelques informations de facturation en plus, exigées sur une facture professionnelle."
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
              onBlur={() => validateField("email")}
              error={errors.email}
              autoComplete="email"
            />
            <TextField
              id="phone"
              label="Téléphone"
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
                qu&rsquo;à établir le devis puis la facture.
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
                    onBlur={() => validateField("siren")}
                    error={errors.siren}
                  />
                  <TextField
                    id="vatNumber"
                    label="TVA intracommunautaire"
                    placeholder="FR12345678901"
                    optional
                    value={values.vatNumber}
                    onChange={(value) => set("vatNumber", value)}
                    onBlur={() => validateField("vatNumber")}
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
            J&rsquo;accepte que ces informations soient utilisées pour répondre à
            ma demande. Elles ne sont ni revendues ni utilisées pour de la
            prospection. Voir la{" "}
            <Link href="/legal/confidentialite" className="underline">
              politique de confidentialité
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
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="blk-sm mt-6 bg-support p-4 text-support-ink outline-none"
        >
          {globalError}
        </p>
      )}
    </div>
  );
}
