"use client";

import type { ReactNode } from "react";

/**
 * Primitives de formulaire.
 *
 * Ecrites a la main plutot qu'importees : le site n'utilise pas shadcn, et
 * chaque champ doit lire les tokens de la direction artistique (rayon, trait,
 * ombre) pour ne pas jurer avec le reste.
 *
 * Regles a11y communes : chaque champ a un `<label>` relie, l'erreur est
 * annoncee via `aria-describedby` et `role="alert"`, et la hauteur minimale des
 * cibles tactiles est de 44 px.
 */

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-support">
      {message}
    </p>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  optional = false,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  optional?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optional && <span className="ml-2 text-muted">facultatif</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="blk-flat mt-2 min-h-[44px] w-full bg-surface px-4 py-3 text-ink outline-none"
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  rows = 7,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  rows?: number;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="blk-flat mt-2 w-full resize-y bg-surface px-4 py-3 text-ink outline-none"
      />
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <FieldError id={errorId} message={error} />
        <span className="tabular mono ml-auto shrink-0 text-xs text-muted">
          {value.trim().length} caracteres
        </span>
      </div>
    </div>
  );
}

/**
 * Groupe de choix exclusifs presente en cartes.
 *
 * Un `fieldset` avec `legend` plutot qu'un simple titre : c'est ce qui fait
 * annoncer l'intitule du groupe avant chaque option par un lecteur d'ecran.
 */
export function RadioCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; hint?: string }[];
  value: T | "";
  onChange: (value: T) => void;
  error?: string;
  columns?: 1 | 2;
}) {
  const errorId = `${name}-error`;

  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>

      <div
        className={`mt-3 grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`blk-flat flex min-h-[44px] cursor-pointer items-start gap-3 p-4 transition-colors ${
                selected ? "bg-accent text-accent-ink" : "bg-surface text-ink"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-describedby={error ? errorId : undefined}
                className="mt-1 h-4 w-4 shrink-0 accent-current"
              />
              <span>
                <span className="block font-medium">{option.label}</span>
                {option.hint && (
                  <span
                    className={`mt-1 block text-sm ${selected ? "opacity-80" : "text-muted"}`}
                  >
                    {option.hint}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        {/* Jamais pre-coche : le consentement doit etre un geste actif
            (anti dark-pattern, exigence RGPD). */}
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-current"
        />
        <span className="text-sm leading-relaxed text-muted">{children}</span>
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
