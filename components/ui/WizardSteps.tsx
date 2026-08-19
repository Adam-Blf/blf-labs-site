"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWizard, type WizardDirection } from "@/lib/useWizard";

/**
 * Rail de progression + panneaux animes pour un formulaire en plusieurs etapes.
 *
 * Adapte du composant "Wizard Steps" de ddoemonn (catalogue 21st.dev). Deux
 * changements de fond par rapport a l'original :
 *  - les couleurs codees en dur (stone-*, bleus de focus) sont remplacees par
 *    les tokens du site, pour que le composant suive la direction artistique et
 *    le theme clair / sombre ;
 *  - l'import vient de "framer-motion" et non de "motion/react" : le paquet
 *    `motion` n'est pas installe ici.
 *
 * Accessibilite conservee de l'original : annonce vocale de la position,
 * `aria-current="step"`, fleches et touches Debut / Fin sur le rail, focus
 * deplace vers le panneau apres navigation.
 */
export type WizardStep = {
  id: string;
  label: string;
  content: ReactNode;
};

export function WizardSteps({
  steps,
  onComplete,
  onBeforeNext,
  backLabel = "Retour",
  nextLabel = "Continuer",
  finishLabel = "Envoyer la demande",
  submitting = false,
}: {
  steps: WizardStep[];
  onComplete: () => void;
  /**
   * Appele avant de quitter une etape. Rendre faux bloque la progression, ce
   * qui laisse au parent le soin d'afficher ses erreurs de validation. Sans ce
   * point de controle, on pourrait atteindre la derniere etape avec un
   * formulaire vide.
   */
  onBeforeNext?: (index: number) => boolean;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  submitting?: boolean;
}) {
  const {
    index,
    direction,
    furthest,
    total,
    isFirst,
    isLast,
    next,
    back,
    goTo,
  } = useWizard({ total: steps.length, onComplete });

  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  // Apres chaque navigation (Continuer / Retour / rail), le focus se pose sur le
  // panneau de la nouvelle etape : clavier et lecteurs d'ecran suivent la
  // progression au lieu de rester sur un bouton qui a pu disparaitre. On saute le
  // tout premier montage pour ne pas voler le focus a l'arrivee sur la page.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    panelRef.current?.focus();
  }, [index]);

  const step = steps[index];
  if (!step) return null;

  const titleId = "wizard-etape-titre";

  const position = `Étape ${index + 1} sur ${total} : ${step.label}`;

  function onRailKeyDown(event: KeyboardEvent<HTMLElement>) {
    let target = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") target = index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") target = index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = furthest;
    else return;

    event.preventDefault();
    // On ne saute jamais vers une etape jamais atteinte.
    goTo(Math.min(Math.max(target, 0), furthest));
  }

  const variants = {
    enter: (d: WizardDirection) =>
      reduced ? { opacity: 0 } : { opacity: 0, x: d * 24 },
    center: reduced ? { opacity: 1 } : { opacity: 1, x: 0 },
    exit: (d: WizardDirection) =>
      reduced ? { opacity: 0 } : { opacity: 0, x: d * -24 },
  };

  return (
    <div className="w-full">
      {/* Annonce la position aux lecteurs d'ecran sans l'afficher. */}
      <p aria-live="polite" className="sr-only">
        {position}
      </p>

      <ol
        aria-label="Étapes de la commande"
        className="flex list-none items-center gap-2 p-0"
      >
        {steps.map((item, i) => {
          const done = i < index;
          const here = i === index;
          const reachable = i <= furthest;

          const tile = (
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ scale: here ? 1 : 0.92 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2 }}
              className={`tabular grid size-9 place-items-center rounded-full text-sm font-bold ${
                done || here
                  ? "bg-accent text-accent-ink"
                  : "bg-surface text-muted blk-flat"
              }`}
            >
              {done ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                i + 1
              )}
            </motion.span>
          );

          return (
            <li key={item.id} className="flex flex-1 items-center gap-2 last:flex-none">
              {reachable ? (
                <button
                  type="button"
                  tabIndex={here ? 0 : -1}
                  aria-current={here ? "step" : undefined}
                  aria-label={`Étape ${i + 1} sur ${total} : ${item.label}`}
                  onKeyDown={onRailKeyDown}
                  onClick={() => goTo(i)}
                  className="rounded-full"
                >
                  {tile}
                </button>
              ) : (
                <span>
                  <span className="sr-only">{`Étape ${i + 1} sur ${total} : ${item.label}`}</span>
                  {tile}
                </span>
              )}

              {i < total - 1 && (
                <span
                  aria-hidden="true"
                  className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line"
                >
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-accent"
                    initial={false}
                    animate={{ scaleX: i < index ? 1 : 0 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.3 }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <p id={titleId} className="title mt-6 text-xl">
        {step.label}
      </p>

      <div
        ref={panelRef}
        tabIndex={-1}
        role="group"
        aria-labelledby={titleId}
        className="relative mt-4 outline-none"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduced ? { duration: 0 } : { duration: 0.22 }}
          >
            {step.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-3">
        {!isFirst && (
          <button
            type="button"
            onClick={back}
            className="blk-sm title min-h-[44px] bg-surface px-5 py-3 text-ink"
          >
            {backLabel}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (onBeforeNext && !onBeforeNext(index)) return;
            next();
          }}
          disabled={submitting}
          className="blk-sm title ml-auto min-h-[44px] bg-accent px-6 py-3 text-accent-ink disabled:opacity-60"
        >
          {submitting ? "Envoi en cours" : isLast ? finishLabel : nextLabel}
        </button>
      </div>
    </div>
  );
}
