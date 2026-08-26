"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthShell } from "@/components/admin/AuthShell";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Enrolement du second facteur. Supabase renvoie un QR a scanner dans une
 * application d'authentification (Google Authenticator, Authy...). Le facteur
 * reste "non verifie" tant que le premier code n'a pas ete valide : si l'ecran
 * est quitte avant, on le desenrole pour ne pas laisser de facteur orphelin.
 */
export default function EnrollTotpPage() {
  const router = useRouter();
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const factorIdRef = useRef<string | null>(null);
  const verifiedRef = useRef(false);

  useEffect(() => {
    // Client construit paresseusement, cote navigateur uniquement (jamais au
    // prerender, ou la cle publique peut manquer de l'environnement de build).
    const supabase = supabaseBrowser();
    let active = true;
    (async () => {
      // Un facteur verifie existe deja -> on va directement a la verification.
      const { data: list } = await supabase.auth.mfa.listFactors();
      if (list?.totp?.some((f) => f.status === "verified")) {
        router.replace("/admin/2fa");
        return;
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "BLF Labs Admin",
      });
      if (!active) return;
      if (error || !data) {
        setError("Impossible de démarrer l'enrôlement.");
        return;
      }
      factorIdRef.current = data.id;
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    })();

    return () => {
      active = false;
      // Nettoyage d'un facteur non verifie a la sortie.
      const id = factorIdRef.current;
      if (id && !verifiedRef.current) {
        void supabase.auth.mfa.unenroll({ factorId: id });
      }
    };
  }, [router]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    const factorId = factorIdRef.current;
    if (!factorId) return;
    setBusy(true);
    setError("");

    const supabase = supabaseBrowser();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error || !challenge.data) {
      setError("Échec du défi. Réessaie.");
      setBusy(false);
      return;
    }
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    if (verify.error) {
      setError("Code incorrect. Vérifie l'heure de ton téléphone.");
      setBusy(false);
      return;
    }
    verifiedRef.current = true;
    router.replace("/admin");
  }

  return (
    <AuthShell>
      <Card className="p-8">
        <h1 className="title text-2xl">Activer la double authentification</h1>
        <p className="mt-2 text-sm text-muted">
          Scanne ce QR code avec ton application d&apos;authentification, puis
          saisis le code à 6 chiffres.
        </p>

        {error && (
          <p className="mt-4 blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt="QR code d'enrolement TOTP"
              className="blk-sm bg-paper"
              width={200}
              height={200}
            />
          ) : (
            <div className="h-[200px] w-[200px] blk-sm bg-surface" />
          )}
        </div>

        {secret && (
          <p className="mt-3 text-center text-xs text-muted">
            Saisie manuelle : <span className="select-all">{secret}</span>
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
          />
          <Button type="submit" disabled={busy || code.length < 6}>
            {busy ? "Vérification..." : "Activer et entrer"}
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
