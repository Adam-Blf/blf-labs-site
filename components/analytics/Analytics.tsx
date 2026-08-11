"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  EVENEMENT_CONSENTEMENT,
  identifiantMesure,
  lireConsentement,
} from "@/lib/consent";

/**
 * Chargeur de Google Analytics 4, strictement conditionne au consentement.
 *
 * Le script n'est pas monte tant que le visiteur n'a pas accepte. Ce n'est pas
 * un detail d'implementation : tant que rien n'est monte, aucune requete ne
 * part vers un domaine Google. Le mode "consentement refuse" de Google, lui,
 * charge quand meme la bibliotheque, ce qui reste un appel a un tiers avant
 * consentement.
 *
 * Le mode de consentement v2 est declare malgre tout, en refus par defaut, et
 * bascule en accord juste apres. Cela couvre le cas ou le script serait charge
 * par une autre voie plus tard, et c'est ce que Google attend pour ne pas
 * inferer de profil publicitaire.
 *
 * `anonymize_ip` n'a pas d'equivalent explicite en GA4, l'anonymisation y est
 * appliquee par defaut cote Google. On desactive en revanche les signaux
 * publicitaires, qui n'ont aucun usage pour un site vitrine.
 */
export function Analytics() {
  const identifiant = identifiantMesure();
  const [accepte, setAccepte] = useState(false);

  useEffect(() => {
    setAccepte(lireConsentement() === "accepte");

    function surChangement(evenement: Event) {
      const detail = (evenement as CustomEvent<string>).detail;
      setAccepte(detail === "accepte");
    }

    window.addEventListener(EVENEMENT_CONSENTEMENT, surChangement);
    return () =>
      window.removeEventListener(EVENEMENT_CONSENTEMENT, surChangement);
  }, []);

  if (!identifiant || !accepte) return null;

  return (
    <>
      <Script
        id="ga-source"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${identifiant}`}
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
          });
          gtag('consent', 'update', { analytics_storage: 'granted' });
          gtag('config', '${identifiant}', {
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
