"use client";

import Link from "next/link";
import { ecrireConsentement, identifiantMesure } from "@/lib/consentement/consent";
import { useConsentement } from "@/lib/consentement/useConsent";

/**
 * Bandeau de consentement a la mesure d'audience.
 *
 * Points de conformite tenus ici, et pas seulement affiches :
 *
 * - Refuser est exactement aussi simple qu'accepter. Meme taille, meme forme,
 *   meme nombre de clics, cote a cote. Un bouton de refus grise, cache dans un
 *   second ecran ou ecrit plus petit est un schema trompeur, et c'est la faute
 *   la plus sanctionnee par la CNIL sur ce sujet.
 * - Aucun depot ni aucune lecture avant le choix : le chargeur de mesure n'est
 *   monte qu'apres acceptation.
 * - Le choix se retire aussi facilement qu'il se donne, depuis la page de
 *   confidentialite.
 * - Le bandeau ne bloque pas la page. Il n'y a rien a consentir pour lire un
 *   site vitrine, un mur de consentement serait disproportionne.
 *
 * Sans identifiant de mesure configure, le bandeau ne s'affiche pas du tout :
 * on ne demande pas un accord pour un traitement qui n'existe pas.
 */
export function ConsentBanner() {
  const identifiant = identifiantMesure();
  const consentement = useConsentement();

  // `null` signifie "pas encore lu", ce qui n'est pas la meme chose que
  // "inconnu". Rendre le bandeau tant qu'on ne sait pas le ferait apparaitre
  // puis disparaitre chez quelqu'un qui a deja repondu.
  if (!identifiant || consentement !== "inconnu") return null;

  return (
    <div
      // `region` plutot qu'un dialogue modal : le bandeau n'emprisonne pas le
      // focus et ne bloque pas la lecture.
      role="region"
      aria-label="Consentement a la mesure d'audience"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4"
    >
      <div className="blk mx-auto flex max-w-3xl flex-col gap-5 p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted-strong">
          On mesure la fréquentation du site pour savoir quelles pages servent
          vraiment. Rien n&rsquo;est déposé sur votre appareil sans votre accord,
          et refuser ne change rien à ce que vous pouvez lire.{" "}
          <Link
            href="/legal/confidentialite"
            className="underline underline-offset-4"
          >
            En savoir plus
          </Link>
        </p>

        {/* Les deux actions ont strictement le meme poids visuel. */}
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => ecrireConsentement("refuse")}
            className="btn-pill min-h-[44px] border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => ecrireConsentement("accepte")}
            className="btn-pill min-h-[44px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
