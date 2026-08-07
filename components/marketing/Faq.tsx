"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQ } from "@/content/faq";

/**
 * Accordeon de questions frequentes.
 *
 * Ecrit a la main plutot qu'importe d'une librairie : le besoin tient en un
 * `useState`, et une dependance Radix supplementaire pour ouvrir un paragraphe
 * ne se justifie pas.
 *
 * Accessibilite : chaque en-tete est un vrai `<button>` dans un `<h3>`, avec
 * `aria-expanded` et `aria-controls`. Le panneau reste dans le DOM le temps de
 * l'animation de fermeture, mais l'attribut `hidden` du bouton renseigne les
 * lecteurs d'ecran sans attendre.
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="rule-b">
      <div className="section mx-auto max-w-3xl px-5">
        <h2 className="title text-4xl sm:text-5xl lg:text-6xl">
          Ce qu&rsquo;on <span className="grad-text">nous demande</span>
        </h2>

        <ul className="mt-10 space-y-3">
          {FAQ.map((item, index) => {
            const open = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <li key={item.question} className="blk-sm overflow-hidden bg-surface">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="title text-lg">{item.question}</span>

                    {/* Croix qui pivote : un seul trace pour les deux etats,
                        plutot que deux icones qui se remplacent. */}
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-support"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 leading-relaxed text-muted">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
