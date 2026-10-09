"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { Color, MathUtils, type Group } from "three";
import { flaskPoints, liquidPoints } from "./flaskProfile";
import type { SceneColors } from "./useThemeColors";

/**
 * La fiole du logo, en volume, avec son liquide.
 *
 * Le verre utilise une vraie transmission : la paroi réfracte ce qui passe
 * derrière au lieu de le flouter. C'est la distinction qui rend cet effet
 * acceptable ici alors que le verre dépoli a été retiré du site. Un flou
 * d'arrière-plan est le décor par défaut des maquettes générées, une réfraction
 * calculée est un matériau.
 *
 * Le liquide est un second volume, en aplat franc, sans dégradé : il reprend le
 * violet du logo, qui ne sert qu'aux points d'accent sur tout le site.
 */
type FlaskProps = {
  colors: SceneColors;
  /** Remplissage, de 0 à 1. Le défilement le fera monter (lot suivant). */
  fill?: number;
};

/** Segments de révolution. 64 suffit à masquer les facettes sur une silhouette
 *  aussi lisse, et divise par deux le coût face au 128 par défaut. */
const SEGMENTS = 64;

export function Flask({ colors, fill = 0.42 }: FlaskProps) {
  const group = useRef<Group>(null);

  const glass = useMemo(() => flaskPoints(), []);
  const liquid = useMemo(() => liquidPoints(fill), [fill]);

  /**
   * Fond que la paroi réfracte.
   *
   * Ce matériau remplace ce qu'il y a derrière le verre par ce fond. Le canvas
   * étant transparent, laisser la valeur par défaut donnait un tampon vide,
   * c'est-à-dire du noir : la fiole rendait un aplat noir opaque.
   *
   * On part donc du papier de la page, mais relevé vers le blanc de marque. En
   * thème clair le décalage ne se voit pas, les deux sont déjà clairs. En thème
   * sombre il est indispensable : `--paper` y vaut #111016, et un verre qui ne
   * réfracte que du quasi-noir n'est plus du verre, c'est un trou. Du verre
   * capte toujours un peu de lumière, même dans une pièce sombre.
   */
  const background = useMemo(
    () => new Color(colors.paper).lerp(new Color(colors.neige), 0.38),
    [colors.paper, colors.neige],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    // Rotation lente et continue : l'objet vit sans réclamer l'attention.
    node.rotation.y += delta * 0.16;

    // Parallaxe. `damp` est utilisé plutôt qu'un `lerp` par image : le résultat
    // ne dépend plus de la fréquence d'affichage, donc le mouvement est le même
    // sur un écran 60 Hz et sur un 144 Hz.
    const { x, y } = state.pointer;
    node.rotation.z = MathUtils.damp(node.rotation.z, -x * 0.12, 3, delta);
    node.rotation.x = MathUtils.damp(node.rotation.x, y * 0.14, 3, delta);
    node.position.y = MathUtils.damp(node.position.y, y * 0.18, 3, delta);
  });

  return (
    <group ref={group} rotation={[0, 0, 0.18]}>
      <mesh castShadow={false} receiveShadow={false}>
        <latheGeometry args={[glass, SEGMENTS]} />
        {/*
          `samples` et `resolution` sont volontairement bas. Ce matériau rend la
          scène dans une cible séparée à chaque image : c'est le poste de coût
          dominant de la page, et le doubler ne se voit presque pas sur un objet
          de cette taille.
        */}
        <MeshTransmissionMaterial
          samples={4}
          resolution={192}
          background={background}
          thickness={0.45}
          roughness={0.06}
          chromaticAberration={0.14}
          anisotropy={0.18}
          distortion={0.18}
          distortionScale={0.3}
          temporalDistortion={0.08}
          ior={1.42}
          backside={false}
          // Teinte du verre, et non couleur de page : elle reste sur le blanc
          // de marque dans les deux thèmes. La poser sur `--paper` revenait à
          // teindre la paroi en quasi-noir dès le thème sombre, ce qui éteignait
          // toute la fiole, liquide compris.
          color={colors.neige}
          attenuationColor={colors.neige}
        />
      </mesh>

      <mesh>
        <latheGeometry args={[liquid, SEGMENTS]} />
        {/*
          Le liquide émet légèrement sa propre couleur. Sans cela, en thème
          sombre, il ne reçoit presque aucune lumière derrière la paroi et la
          fiole entière se réduit à une silhouette noire : le violet du logo,
          c'est-à-dire le seul rappel de marque de la scène, disparaît. Un
          liquide de laboratoire qui luit un peu est en outre plus juste qu'un
          liquide parfaitement mat.
        */}
        <meshStandardMaterial
          color={colors.violet}
          emissive={colors.violet}
          emissiveIntensity={0.4}
          roughness={0.28}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
