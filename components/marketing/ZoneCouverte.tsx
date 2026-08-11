"use client";

import { useState } from "react";
import { identifiantMesure } from "@/lib/consent";
import { useConsentement } from "@/lib/useConsent";

/**
 * Carte de la zone d'intervention.
 *
 * Deux choix expliquent tout ce fichier.
 *
 * PAS D'ADRESSE. La carte montre l'Ile-de-France, pas une epingle sur un
 * batiment. L'adresse enregistree de l'entreprise est un domicile : la publier
 * la rendrait cliquable en itineraire depuis n'importe quel resultat de
 * recherche, definitivement, puisqu'une adresse indexee ne se retire pas. Le
 * referencement local fonctionne sans, par `areaServed` dans les donnees
 * structurees. Si l'entreprise prend un jour des bureaux, il suffira de
 * remplacer la requete ci-dessous par leur adresse.
 *
 * PAS DE CHARGEMENT AVANT ACCORD. Une iframe Google Maps depose des cookies
 * Google et transmet l'adresse IP du visiteur des l'affichage de la page, sans
 * qu'il ait rien demande. C'est un traceur tiers au sens de l'article 82 de la
 * loi Informatique et Libertes, et la CNIL sanctionne son depot prealable. Tant
 * que le visiteur n'a pas accepte, on affiche un apercu inerte et un bouton :
 * la carte ne se charge qu'au clic, ou apres acceptation du bandeau.
 */

/** Cadrage sur la region, pas sur un point. */
const REQUETE = encodeURIComponent("Île-de-France, France");

export function ZoneCouverte() {
  const consentement = useConsentement();
  const [chargeeALaDemande, setChargeeALaDemande] = useState(false);

  // Sans identifiant de mesure, le site n'a pas de bandeau de consentement.
  // La carte demande alors son propre accord, au clic : le visiteur reste celui
  // qui decide de contacter Google.
  const mesureActive = Boolean(identifiantMesure());
  const accordDonne = mesureActive
    ? consentement === "accepte" || chargeeALaDemande
    : chargeeALaDemande;

  return (
    <section className="rule-t">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title max-w-3xl text-4xl sm:text-5xl">
          Où on <span className="grad-text">intervient</span>
        </h2>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          Toute l&rsquo;Île-de-France, en présentiel pour le cadrage et les
          points d&rsquo;étape, à distance pour le reste. Ailleurs en France,
          entièrement à distance : la méthode ne change pas.
        </p>

        <div className="blk mt-12 overflow-hidden">
          {accordDonne ? (
            <iframe
              title="Carte de la zone d'intervention, Île-de-France"
              src={`https://www.google.com/maps?q=${REQUETE}&z=9&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[380px] w-full border-0"
            />
          ) : (
            <div className="flex h-[380px] flex-col items-center justify-center gap-6 bg-surface-strong px-6 text-center">
              <p className="max-w-md leading-relaxed text-muted">
                La carte est fournie par Google, qui dépose ses propres cookies
                et reçoit votre adresse IP. Elle ne se charge donc pas sans
                votre accord.
              </p>
              <button
                type="button"
                onClick={() => setChargeeALaDemande(true)}
                className="btn-pill min-h-[44px] bg-accent px-6 py-3 font-semibold text-accent-ink"
              >
                Afficher la carte
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-muted">
          Le studio ne reçoit pas dans ses locaux : les rendez-vous se tiennent
          chez vous ou en visioconférence.{" "}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${REQUETE}`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink underline underline-offset-4"
          >
            Ouvrir l&rsquo;itinéraire dans Google Maps
          </a>
        </p>
      </div>
    </section>
  );
}
