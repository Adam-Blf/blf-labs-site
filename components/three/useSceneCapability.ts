"use client";

import { useEffect, useState } from "react";

/**
 * Décide si une scène WebGL a le droit de tourner sur cette machine.
 *
 * Trois refus possibles, et ils ne se valent pas :
 *
 * 1. `prefers-reduced-motion`. Le bloc CSS global du site neutralise les
 *    transitions et les animations déclarées en CSS, mais il n'arrête ni une
 *    boucle de rendu WebGL ni un `requestAnimationFrame`. Sans ce test en
 *    JavaScript, un visiteur qui a demandé moins de mouvement recevrait quand
 *    même une scène animée en plein écran.
 * 2. WebGL 2.0 absent. On teste en créant un contexte jetable plutôt qu'en
 *    reniflant le navigateur : une version de navigateur ne dit rien d'un pilote
 *    graphique désactivé ou d'une machine virtuelle sans accélération.
 * 3. `Save-Data`. Le visiteur a demandé à son navigateur d'économiser les
 *    données, on ne lui impose pas un moteur 3D.
 *
 * Le résultat vaut `false` au premier rendu, y compris côté serveur, et ne passe
 * à `true` qu'après vérification dans le navigateur. Le repli est donc l'état
 * par défaut, jamais une correction après coup.
 */
export function useSceneCapability(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function evaluate() {
      if (motionQuery.matches) {
        setAllowed(false);
        return;
      }

      if (saveDataRequested()) {
        setAllowed(false);
        return;
      }

      setAllowed(supportsWebGl2());
    }

    evaluate();

    // La préférence de mouvement se change sans recharger la page, sur macOS
    // comme sur Windows. On suit le changement au lieu de figer la décision.
    motionQuery.addEventListener("change", evaluate);
    return () => motionQuery.removeEventListener("change", evaluate);
  }, []);

  return allowed;
}

/**
 * Le contexte est libéré tout de suite : les navigateurs plafonnent le nombre de
 * contextes WebGL vivants, et en laisser fuir un ici priverait la vraie scène du
 * sien.
 */
function supportsWebGl2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    // Un navigateur qui lève sur `getContext` ne fera pas mieux ensuite.
    return false;
  }
}

function saveDataRequested(): boolean {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return connection?.saveData === true;
}
