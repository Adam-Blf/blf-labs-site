"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Révèle ses enfants directs au défilement.
 *
 * Règle de sûreté qui commande tout le reste : **rien n'est masqué en CSS**.
 * L'animation part d'un `from`, donc l'état visible est l'état naturel du
 * document. Si le JavaScript ne s'exécute pas, si GSAP échoue à charger, ou si
 * le visiteur a demandé moins de mouvement, le contenu est simplement là. Une
 * révélation au défilement qui masque d'abord en CSS transforme la moindre
 * panne de script en page blanche, et c'est un prix que le contenu d'un site
 * vitrine ne peut pas payer pour un effet.
 *
 * Le mouvement réduit est traité par `gsap.matchMedia` plutôt que par le bloc
 * CSS global : ce bloc annule les durées de transition, il n'empêche pas GSAP
 * de créer ses tweens. Ici, sous mouvement réduit, aucun tween n'est créé du
 * tout.
 *
 * Les enfants sont ciblés par le `scope` du hook, jamais par un sélecteur
 * global : deux sections révélées sur la même page ne doivent pas s'animer
 * l'une l'autre.
 */
type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Décalage entre deux enfants, en secondes. */
  stagger?: number;
  /** Amplitude du glissement vertical, en pixels. */
  shift?: number;
};

export function Reveal({
  children,
  className,
  stagger = 0.09,
  shift = 26,
}: RevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const cibles = Array.from(root.children);
      if (cibles.length === 0) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(cibles, {
          opacity: 0,
          y: shift,
          duration: 0.7,
          ease: "power2.out",
          stagger,
          // L'état d'arrivée doit être l'état naturel du document, pas un état
          // écrit par GSAP. Sans cela, les cartes restaient décalées de 26 px
          // une fois l'animation finie : GSAP laissait sa dernière valeur en
          // style en ligne, et plus rien ne la reprenait.
          clearProps: "opacity,transform,translate,rotate,scale",
          scrollTrigger: {
            trigger: root,
            // Se déclenche quand le haut du bloc atteint 85% de la hauteur de
            // fenêtre : l'élément est déjà entré dans le champ, l'animation
            // accompagne la lecture au lieu de la faire attendre.
            start: "top 85%",
            // Une seule fois. Rejouer à chaque passage donne un site qui
            // clignote quand on remonte, et c'est fatigant sur une page longue.
            once: true,
            // La scène 3D du hero et les polices arrivent après le premier
            // calcul de mise en page et changent la hauteur du document. Sans
            // recalcul, ScrollTrigger garde des positions de déclenchement
            // périmées et les blocs s'animent au mauvais moment, voire jamais.
            invalidateOnRefresh: true,
          },
        });
      });

      // Un dernier recalcul une fois toutes les ressources chargées, pour la
      // même raison.
      function recalculer() {
        ScrollTrigger.refresh();
      }

      if (document.readyState === "complete") {
        recalculer();
      } else {
        window.addEventListener("load", recalculer, { once: true });
      }

      return () => {
        window.removeEventListener("load", recalculer);
        media.revert();
      };
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
