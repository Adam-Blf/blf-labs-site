"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Etat d'un formulaire en plusieurs etapes.
 *
 * Adapte du composant "Wizard Steps" de ddoemonn, catalogue 21st.dev
 * (https://21st.dev/@ddoemonn/components/wizard-steps). La logique d'etat est
 * isolee ici, l'affichage vit dans components/ui/WizardSteps.tsx : le hook est
 * ainsi testable sans monter de composant.
 *
 * `furthest` retient l'etape la plus avancee atteinte. C'est ce qui autorise le
 * retour en arriere par le rail de progression sans permettre de sauter une
 * etape jamais remplie.
 */
export type WizardDirection = 1 | -1;

export type UseWizardOptions = {
  total: number;
  onComplete?: () => void;
};

function clampIndex(value: number, total: number) {
  if (total < 1) return 0;
  return Math.max(0, Math.min(total - 1, Math.trunc(value)));
}

export function useWizard({ total, onComplete }: UseWizardOptions) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<WizardDirection>(1);
  const [furthest, setFurthest] = useState(0);

  // Garde la derniere fonction de fin sans la mettre en dependance des
  // callbacks : sinon `next` change d'identite a chaque rendu du parent.
  const finish = useRef(onComplete);
  finish.current = onComplete;

  const goTo = useCallback(
    (to: number) => {
      const target = clampIndex(to, total);
      setIndex((current) => {
        if (target === current) return current;
        setDirection(target > current ? 1 : -1);
        setFurthest((seen) => Math.max(seen, target));
        return target;
      });
    },
    [total],
  );

  const next = useCallback(() => {
    setIndex((current) => {
      if (current >= total - 1) {
        finish.current?.();
        return current;
      }
      setDirection(1);
      setFurthest((seen) => Math.max(seen, current + 1));
      return current + 1;
    });
  }, [total]);

  const back = useCallback(() => {
    setIndex((current) => {
      if (current <= 0) return current;
      setDirection(-1);
      return current - 1;
    });
  }, []);

  return {
    index,
    direction,
    furthest,
    total,
    isFirst: index === 0,
    isLast: index === total - 1,
    next,
    back,
    goTo,
  };
}
