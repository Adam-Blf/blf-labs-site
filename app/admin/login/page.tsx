"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { requestAdminLink, type LoginState } from "../auth-actions";

/**
 * Facteur 1 : lien magique. Facteur 2 (TOTP) sur l'ecran suivant. On n'affiche
 * jamais si l'email est connu ou non : meme confirmation dans tous les cas.
 */
export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    requestAdminLink,
    {},
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Card className="p-8">
        <h1 className="title text-2xl">Back-office BLF Lab&apos;s</h1>
        <p className="mt-2 text-sm text-muted">
          Accès réservé. Un lien de connexion est envoyé par email, puis un code
          de ton application d&apos;authentification est demandé.
        </p>

        {state.sent ? (
          <p className="mt-6 blk-sm bg-support p-4 text-sm text-support-ink">
            Si cette adresse est autorisée, un lien vient d&apos;être envoyé.
            Ouvre-le sur cet appareil.
          </p>
        ) : (
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
            {state.error && (
              <p className="text-sm text-accent-ink bg-accent blk-sm px-3 py-2">
                {state.error}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Envoi..." : "Recevoir le lien"}
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}
