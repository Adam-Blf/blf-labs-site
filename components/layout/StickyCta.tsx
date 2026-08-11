"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { identifiantMesure } from "@/lib/consent";
import { useConsentement } from "@/lib/useConsent";

/**
 * Appel a l'action persistant, sur telephone uniquement.
 *
 * Le probleme qu'il resout : sur un ecran de moins de 640 px, le bouton
 * "Demarrer un projet" de l'en-tete est masque (`hidden sm:block`), et
 * l'en-tete elle-meme se retire des qu'on defile vers le bas. Un visiteur au
 * milieu d'une page n'avait donc plus aucun moyen visible de passer commande :
 * il devait remonter, ouvrir le menu, puis trouver le lien. C'est exactement la
 * ou se perd une intention d'achat.
 *
 * Trois regles, chacune pour eviter de creer un probleme en en resolvant un :
 *
 * - Il n'apparait qu'apres 600 px de defilement. En haut de page, le hero porte
 *   deja ses deux boutons : deux appels a l'action simultanes se concurrencent
 *   et n'en valent qu'un seul.
 * - Il ne s'affiche jamais sur `/commander`. Proposer d'aller commander a
 *   quelqu'un qui est en train de remplir le formulaire, en lui masquant au
 *   passage le bas de ce formulaire, serait absurde.
 * - Il ne s'affiche que sous `sm`. Au-dessus, le bouton de l'en-tete existe.
 *
 * L'ecouteur est passif et n'ecrit qu'un booleen, comme celui de l'en-tete : le
 * navigateur n'est pas sollicite a chaque pixel.
 */
const SEUIL_DEFILEMENT = 600;

export function StickyCta() {
  const chemin = usePathname();
  const consentement = useConsentement();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function surDefilement() {
      setVisible(window.scrollY > SEUIL_DEFILEMENT);
    }

    surDefilement();
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  if (chemin?.startsWith("/commander")) return null;

  /*
   * Le bandeau de consentement occupe exactement le meme bas d'ecran. A la
   * premiere visite, les deux se superposaient : le bandeau recouvrait le
   * bouton, ou l'inverse selon l'ordre de rendu. Le consentement passe d'abord,
   * parce qu'il est une obligation legale et qu'il ne demande qu'un clic ; le
   * bouton revient ensuite, pour toute la suite de la visite.
   *
   * `null` signifie que le stockage n'a pas encore ete lu : on ne montre rien
   * plutot que de faire clignoter le bouton pendant l'hydratation.
   */
  const bandeauEnAttente =
    Boolean(identifiantMesure()) && consentement !== "accepte" && consentement !== "refuse";
  if (bandeauEnAttente) return null;

  return (
    <div
      // `pb-[env(safe-area-inset-bottom)]` : sans lui, la barre passe sous la
      // barre de gestes des iPhone recents et le bouton devient a moitie
      // inatteignable.
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-[150%]"
      }`}
    >
      <Link
        href="/commander"
        // 56 px de haut : au-dessus du plancher de 44 px des cibles tactiles,
        // parce que c'est le bouton le plus important du site sur mobile.
        className="btn-pill flex min-h-[56px] items-center justify-center bg-accent px-6 text-base font-semibold text-accent-ink shadow-lg"
      >
        Démarrer un projet
      </Link>
    </div>
  );
}
