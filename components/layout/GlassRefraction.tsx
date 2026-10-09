/**
 * Carte de déformation du verre de la barre de navigation.
 *
 * Ce filtre est la raison pour laquelle la barre peut être en verre sans
 * réintroduire le verre dépoli qui avait été retiré du site. Il ne floute rien :
 * il décale chaque pixel de l'arrière-plan selon un bruit lisse, donc ce qui
 * passe derrière reste net et lisible, seulement courbé.
 *
 * Le composant ne rend rien de visible, il ne fait que déposer la définition du
 * filtre dans le document pour que le CSS puisse la référencer.
 *
 * Pourquoi pas `liquid-glass-js`, la bibliothèque de référence sur le sujet :
 * elle capture la page dans un instantané `html2canvas` unique, puis réfracte
 * cette image figée. Sur une barre fixe qui survole du contenu qui défile, le
 * verre montrerait donc une photo périmée de la page, et la rafraîchir
 * imposerait de rasteriser tout le DOM à chaque défilement. Sa feuille de style
 * impose en prime `color: white` et `system-ui` en dur, ce qui casserait à la
 * fois le thème clair et Archivo.
 */
export function GlassRefraction() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute h-0 w-0"
    >
      <defs>
        <filter
          id="blf-refraction"
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          {/*
            Fréquences volontairement dissymétriques : plus basse à
            l'horizontale qu'à la verticale. La barre est large et courte, un
            bruit isotrope y produisait des ondulations serrées qui ressemblaient
            à du verre granité, pas à une vitre.
          */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.017"
            numOctaves={2}
            seed={7}
            result="bruit"
          />
          {/*
            Le bruit brut donne un déplacement haché. On l'adoucit avant de s'en
            servir : ce sont les grandes ondes qui lisent comme de l'épaisseur de
            verre, les petites lisent comme un défaut d'image.
          */}
          <feGaussianBlur in="bruit" stdDeviation={1.6} result="bruitDoux" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="bruitDoux"
            scale={11}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
