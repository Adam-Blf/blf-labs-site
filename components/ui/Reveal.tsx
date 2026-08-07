"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Apparition au defilement.
 *
 * `whileInView` avec `once` : l'element se revele une seule fois, il ne
 * clignote pas quand on remonte la page.
 *
 * L'amplitude reste faible (16 px) volontairement : une entree spectaculaire
 * fatigue sur un site qu'on parcourt en entier, et les grands deplacements
 * provoquent une barre de defilement horizontale sur mobile.
 *
 * `prefers-reduced-motion` est respecte globalement par globals.css, qui ramene
 * toutes les durees a 0.01 ms.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
