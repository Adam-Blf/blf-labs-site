"use client";

import {
  ecrireConsentement,
  identifiantMesure,
  type Consentement,
} from "@/lib/consentement/consent";
import { useConsentement } from "@/lib/consentement/useConsent";

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
  const etat = useConsentement();

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
      {/* Tant que l'etat vaut `null`, le stockage local n'a pas encore ete lu :
          on n'annonce rien plutot que d'annoncer un choix qui n'est pas le sien. */}
      <p className="text-sm text-muted">{etat ? LIBELLES[etat] : ""}</p>

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
