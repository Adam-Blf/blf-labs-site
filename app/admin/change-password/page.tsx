"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthShell } from "@/components/admin/AuthShell";
import { changeAdminPassword, type PasswordState } from "../auth-actions";

/**
 * Changement force du mot de passe provisoire, a la premiere connexion. Tant que
 * le flag `must_change_password` n'est pas baisse, le proxy renvoie ici avant
 * tout acces au back-office et avant l'enrolement TOTP.
 */
export default function ChangePasswordPage() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(
    changeAdminPassword,
    {},
  );

  return (
    <AuthShell>
      <Card className="p-8">
        <h1 className="title text-2xl">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-muted">
          Le mot de passe provisoire doit être remplacé. Choisis-en un d&apos;au
          moins 10 caractères, différent du provisoire.
        </p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Nouveau mot de passe</span>
            <input
              type="password"
              name="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="blk-sm bg-paper px-4 py-3 text-ink"
              placeholder="••••••••••"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Confirmation</span>
            <input
              type="password"
              name="confirm"
              required
              minLength={10}
              autoComplete="new-password"
              className="blk-sm bg-paper px-4 py-3 text-ink"
              placeholder="••••••••••"
            />
          </label>
          {state.error && (
            <p className="text-sm text-accent-ink bg-accent blk-sm px-3 py-2">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement..." : "Définir et continuer"}
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
