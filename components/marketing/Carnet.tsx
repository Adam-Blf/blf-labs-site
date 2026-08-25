"use client";

import Link from "next/link";
import { useState } from "react";
import { TEXTES_CONSENTEMENT, type SourceConsentement } from "@/content/consentement";

/**
 * L'INSCRIPTION AU CARNET DU STUDIO.
 *
 * Deux champs, une case, et rien d'autre. Ce qui compte ici tient dans ce qui
 * a ete refuse plutot que dans ce qui a ete ajoute :
 *
 *   - AUCUNE CASE PRE-COCHEE. Une case cochee par defaut n'est pas un
 *     consentement, c'est un piege, et elle est nulle en droit ;
 *   - AUCUN MUR D'EMAIL. Rien sur ce site n'est echange contre une adresse. Les
 *     ressources restent en telechargement libre, c'est une regle du depot ;
 *   - AUCUNE FENETRE SURGISSANTE, aucun compte a rebours, aucune promesse
 *     invente. Le rythme annonce est celui qui sera tenu.
 *
 * La reponse est toujours la meme, adresse nouvelle ou deja connue : "regardez
 * votre boite". Repondre differemment selon le cas ferait de ce formulaire un
 * moyen de savoir qui est inscrit, donc qui parle a qui.
 */

type Etat = "repos" | "envoi" | "succes" | "erreur";

export function Carnet({ source = "pied_de_page" }: { source?: SourceConsentement }) {
  const [email, setEmail] = useState("");
  const [accord, setAccord] = useState(false);
  const [etat, setEtat] = useState<Etat>("repos");
  const [message, setMessage] = useState("");
  // Piege a robots : un humain ne le voit pas, donc ne le remplit jamais.
  const [website, setWebsite] = useState("");

  async function envoie(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!accord || etat === "envoi") return;

    setEtat("envoi");
    try {
      const reponse = await fetch("/api/inscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          pageOrigine: window.location.pathname,
          website,
        }),
      });

      if (reponse.ok) {
        setEtat("succes");
        setEmail("");
        setAccord(false);
        return;
      }

      const corps = (await reponse.json().catch(() => null)) as { error?: string } | null;
      setMessage(corps?.error ?? "Inscription impossible pour le moment.");
      setEtat("erreur");
    } catch {
      setMessage("Inscription impossible pour le moment.");
      setEtat("erreur");
    }
  }

  if (etat === "succes") {
    return (
      <div className="blk-sm bg-paper p-4">
        <p className="text-sm leading-relaxed text-ink">
          Un email de confirmation vient de partir. Tant que vous n&rsquo;avez
          pas cliqué dedans, rien n&rsquo;est enregistré et vous ne recevrez
          rien.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoie} className="space-y-3">
      <label htmlFor="carnet-email" className="mono block text-[0.7rem] text-faint">
        Le carnet du studio, un email par mois
      </label>

      <input
        id="carnet-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(evenement) => setEmail(evenement.target.value)}
        placeholder="vous@exemple.fr"
        className="blk-sm w-full bg-paper px-3 py-2 text-sm text-ink outline-none"
      />

      <label className="flex items-start gap-2 text-xs leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={accord}
          onChange={(evenement) => setAccord(evenement.target.checked)}
          className="mt-0.5 shrink-0"
        />
        {/*
          Le libelle vient de content/consentement.ts, le MEME objet que la
          route recopie dans la preuve. Ecrire la phrase ici en dur laissait
          les deux diverger, et c'est la preuve qui devenait fausse.
        */}
        <span>
          {TEXTES_CONSENTEMENT[source]}{" "}
          <Link href="/legal/confidentialite" className="underline">
            Politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {/* Hors flux, masque aux lecteurs d'ecran, exclu de la tabulation. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0">
        <label htmlFor="carnet-website">Ne pas remplir</label>
        <input
          id="carnet-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(evenement) => setWebsite(evenement.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={!accord || etat === "envoi"}
        className="blk-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-40"
      >
        {etat === "envoi" ? "Envoi..." : "S'inscrire"}
      </button>

      {etat === "erreur" && (
        <p role="alert" className="blk-sm bg-support px-3 py-2 text-xs text-support-ink">
          {message}
        </p>
      )}
    </form>
  );
}
