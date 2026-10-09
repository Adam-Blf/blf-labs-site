"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { Flask } from "./Flask";
import { useThemeColors } from "./useThemeColors";

/**
 * Scène du hero : la fiole du logo en volume, posée sur la paillasse.
 *
 * Deux contraintes du projet dictent tout ce fichier.
 *
 * 1. Aucun CDN. `Environment` est donc rendu à partir de sources décrites ici,
 *    jamais d'un `preset` : les presets de drei téléchargent leur carte
 *    d'environnement depuis un dépôt distant, ce qui casserait la promesse d'un
 *    site qui s'affiche à l'identique sans accès sortant.
 * 2. Pas de halo diffus. Les deux disques flous de l'ancien hero ont été
 *    retirés parce qu'un dégradé de couleur derrière un titre est la signature
 *    des maquettes générées. La scène rend donc un objet net, à silhouette
 *    lisible, pas une nappe de couleur.
 */
type HeroSceneProps = {
  /**
   * Faux quand le hero est sorti de l'écran. La boucle de rendu s'arrête alors
   * complètement : continuer à calculer une réfraction que personne ne regarde
   * vide la batterie pour rien.
   */
  active: boolean;
};

export function HeroScene({ active }: HeroSceneProps) {
  const colors = useThemeColors();

  return (
    <Canvas
      // Le canvas est décoratif : la fiole est déjà dans le logo, et le texte du
      // hero dit tout. Rien ici n'est une information à restituer.
      aria-hidden="true"
      frameloop={active ? "always" : "never"}
      // Plafond à 1,75 plutôt qu'au ratio natif : au-delà, le coût de la
      // transmission grimpe au carré sans gain visible sur un objet lisse.
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.4], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      // Autorise la baisse de résolution plutôt que la chute d'images sur une
      // machine modeste.
      performance={{ min: 0.5 }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-5, -2, -3]} intensity={0.35} />

      {/*
        Carte d'environnement construite sur place. Ce sont ces surfaces
        lumineuses que la paroi réfracte et qui donnent au verre ses arêtes.
        `frames={1}` la calcule une seule fois : la scène ne bouge pas assez pour
        justifier de la recalculer à chaque image.
      */}
      <Environment resolution={192} frames={1}>
        {/*
          Nappe claire qui enveloppe toute la scène. Sans elle, l'environnement
          est presque entièrement noir, et le verre vide au-dessus du liquide
          rend en aplat noir opaque au lieu de rendre du verre : une paroi
          transparente ne peut réfracter que ce qu'on lui donne à réfracter.
        */}
        <Lightformer
          form="rect"
          intensity={1.15}
          position={[0, 0, -12]}
          scale={[40, 40, 1]}
          color={colors.neige}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[0, 0, 12]}
          rotation={[0, Math.PI, 0]}
          scale={[40, 40, 1]}
          color={colors.neige}
        />
        <Lightformer
          intensity={2.6}
          position={[0, 6, -4]}
          scale={[12, 3, 1]}
          color={colors.neige}
        />
        <Lightformer
          intensity={1.5}
          position={[-6, 1, -2]}
          scale={[3, 8, 1]}
          color={colors.violet}
        />
        <Lightformer
          intensity={1.1}
          position={[6, -2, -2]}
          scale={[3, 6, 1]}
          color={colors.citron}
        />
      </Environment>

      {/*
        La fiole tient entièrement dans le cadre, à droite du texte. Une première
        version la posait à l'échelle 1,75 : elle débordait de l'écran et ne se
        lisait plus comme un objet, seulement comme un aplat violet en biais,
        c'est-à-dire précisément le halo qu'on avait retiré du hero.
      */}
      <group position={[2.3, 0.05, 0]} scale={0.82}>
        <Flask colors={colors} />
      </group>

      <Drops colors={colors} />
    </Canvas>
  );
}

/**
 * Quelques gouttes en suspension. Elles cassent la symétrie de la fiole et
 * donnent une profondeur lisible, ce qu'un objet seul au centre ne fait pas.
 *
 * Matériau simple et opaque, volontairement : chaque volume en transmission
 * supplémentaire coûterait une passe de rendu de plus.
 */
function Drops({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  const group = useRef<Group>(null);

  const drops = useMemo(
    () =>
      [
        // Les deux premières passent derrière la barre de navigation. C'est
        // volontaire : la barre est en verre à réfraction tant que la page n'a
        // pas défilé, et un verre n'a d'intérêt que s'il a quelque chose à
        // courber. Sans elles, l'effet existait dans le code et ne se voyait
        // nulle part à l'écran.
        { position: [-1.05, 2.5, -1.6], radius: 0.1, color: colors.violet },
        { position: [1.35, 2.72, -2], radius: 0.07, color: colors.citron },
        { position: [1.5, -1.6, -1.4], radius: 0.06, color: colors.citron },
        { position: [3.05, -0.95, -2], radius: 0.045, color: colors.violet },
      ] as const,
    [colors.violet, colors.citron],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    const { x, y } = state.pointer;
    // Les gouttes suivent le pointeur plus franchement que la fiole : l'écart
    // entre les deux plans est ce qui donne la sensation de profondeur.
    node.position.x = MathUtils.damp(node.position.x, x * 0.42, 2.4, delta);
    node.position.y = MathUtils.damp(node.position.y, y * 0.3, 2.4, delta);
  });

  return (
    <group ref={group}>
      {drops.map((drop) => (
        <mesh key={drop.position.join()} position={[...drop.position]}>
          <sphereGeometry args={[drop.radius, 24, 24]} />
          <meshStandardMaterial
            color={drop.color}
            roughness={0.35}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}
