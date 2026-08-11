"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSceneCapability } from "./useSceneCapability";

/**
 * Point de montage de la scène 3D du hero.
 *
 * Ce composant existe pour deux raisons précises, et pas seulement par goût du
 * découpage.
 *
 * 1. `next/dynamic` avec `ssr: false` est refusé dans un Server Component en
 *    Next 16. `Hero` est un Server Component, l'import différé doit donc vivre
 *    dans un composant client, c'est-à-dire ici.
 * 2. La scène ne doit exister que si la machine et le visiteur l'acceptent. Le
 *    repli n'est pas une correction appliquée après coup : tant que rien n'a été
 *    vérifié, rien n'est chargé. Le hero garde alors sa grille millimétrée, qui
 *    est un fond complet à elle seule.
 *
 * Conséquence utile : ni three, ni drei, ni la scène ne rentrent dans le paquet
 * initial. Un visiteur en mouvement réduit ne télécharge jamais ces fichiers.
 */
const HeroScene = dynamic(
  () => import("./HeroScene").then((mod) => mod.HeroScene),
  { ssr: false },
);

export function HeroSceneMount() {
  const allowed = useSceneCapability();
  const [visible, setVisible] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    // Sans ce test, la boucle de rendu continue de calculer une réfraction
    // pendant que le visiteur lit le bas de la page. La scène est en haut, elle
    // sort de l'écran très vite.
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,black_70%,transparent)]"
    >
      {allowed ? <HeroScene active={visible} /> : null}
    </div>
  );
}
