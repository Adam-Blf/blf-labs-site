"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthShell } from "@/components/admin/AuthShell";
import { signInAdmin, type LoginState } from "../auth-actions";

/**
 * Facteur 1 : email + mot de passe. Facteur 2 (TOTP) sur l'ecran suivant. A la
 * premiere connexion, le mot de passe provisoire doit etre change avant tout
 * acces. On n'affiche jamais si l'email est connu ou non : erreur neutre.
 */
export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    signInAdmin,
    {},
  );

  return (
    <AuthShell>
      <Card className="p-8">
        <h1 className="title text-2xl">Back-office</h1>
        <p className="mt-2 text-sm text-muted">
          Accès réservé. Email et mot de passe, puis un code de ton application
          d&apos;authentification. À la première connexion, le mot de passe
          provisoire doit être changé.
        </p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Adresse email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="blk-sm bg-paper px-4 py-3 text-ink"
              placeholder="prenom@domaine.fr"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Mot de passe</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="blk-sm bg-paper px-4 py-3 text-ink"
              placeholder="••••••••"
            />
          </label>
          {state.error && (
            <p className="text-sm text-accent-ink bg-accent blk-sm px-3 py-2">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
