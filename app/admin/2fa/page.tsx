"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Verification du second facteur a chaque connexion. Le code valide fait passer
 * la session en aal2 : RLS ne rend les donnees qu'a partir de la.
 */
export default function VerifyTotpPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const { data: factors, error: listErr } =
      await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.find((f) => f.status === "verified");
    if (listErr || !totp) {
      router.replace("/admin/2fa/enroll");
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (challenge.error || !challenge.data) {
      setError("Échec du défi. Réessaie.");
      setBusy(false);
      return;
    }
    const verify = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    if (verify.error) {
      setError("Code incorrect. Vérifie l'heure de ton téléphone.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Card className="p-8">
        <h1 className="title text-2xl">Vérification en deux étapes</h1>
        <p className="mt-2 text-sm text-muted">
          Saisis le code à 6 chiffres de ton application d&apos;authentification.
        </p>

        {error && (
          <p className="mt-4 blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
            {error}
          </p>
        )}

        <form onSubmit={onVerify} className="mt-6 flex flex-col gap-4">
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="blk-sm bg-paper px-4 py-3 text-center text-xl tracking-[0.4em] text-ink"
            placeholder="000000"
            autoFocus
          />
          <Button type="submit" disabled={busy || code.length < 6}>
            {busy ? "Vérification..." : "Entrer"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
