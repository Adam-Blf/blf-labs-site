"use client";

import { useEffect, useState } from "react";
import {
  EVENEMENT_CONSENTEMENT,
  ecrireConsentement,
  identifiantMesure,
  lireConsentement,
  type Consentement,
} from "@/lib/consent";

const LIBELLES: Record<Consentement, string> = {
  accepte: "Vous avez accepté la mesure d'audience.",
  refuse: "Vous avez refusé la mesure d'audience.",
  inconnu: "Vous n'avez pas encore fait de choix.",
};

/**
 * Retrait et modification du consentement, depuis la page de confidentialite.
 *
 * Le RGPD demande qu'un consentement soit aussi simple a retirer qu'a donner.
 * Un bandeau qui disparait definitivement apres un clic, sans aucun moyen de
 * revenir dessus, ne respecte pas cette exigence : c'est la raison d'etre de ce
 * composant, pas une commodite.
 *
 * L'etat courant est affiche en toutes lettres. Un visiteur doit pouvoir savoir
 * ce qu'il a accepte sans avoir a inspecter son navigateur.
 */
export function ConsentControls() {
  const identifiant = identifiantMesure();
  const [etat, setEtat] = useState<Consentement>("inconnu");
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
    setEtat(lireConsentement());

    function surChangement(evenement: Event) {
      setEtat((evenement as CustomEvent<Consentement>).detail);
    }

    window.addEventListener(EVENEMENT_CONSENTEMENT, surChangement);
    return () =>
      window.removeEventListener(EVENEMENT_CONSENTEMENT, surChangement);
  }, []);

  if (!identifiant) {
    return (
      <p>
        Aucune mesure d&rsquo;audience n&rsquo;est active sur cette
        installation : il n&rsquo;y a rien à accepter ni à refuser.
      </p>
    );
  }

  return (
    <div className="not-prose flex flex-col gap-4">
      {/* `monte` evite une divergence entre le rendu serveur et le navigateur :
          l'etat vit dans le stockage local, que le serveur ne connait pas. */}
      <p className="text-sm text-muted">{monte ? LIBELLES[etat] : ""}</p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => ecrireConsentement("refuse")}
          className="btn-pill min-h-[44px] border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Refuser la mesure
        </button>
        <button
          type="button"
          onClick={() => ecrireConsentement("accepte")}
          className="btn-pill min-h-[44px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink"
        >
          Accepter la mesure
        </button>
      </div>
    </div>
  );
}
