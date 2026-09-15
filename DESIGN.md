---
name: BLF Lab's
description: Studio indépendant de développement, le site se lit comme un plan de ligne dont le terminus est la remise des clés
colors:
  paper: "#f3f4f6"
  surface: "#ffffff"
  ink: "#0b0e13"
  muted: "#454b56"
  muted-strong: "#232830"
  faint: "#5e6571"
  ligne-sites: "#c93418"
  ligne-web: "#7a2fa3"
  ligne-mobile: "#127a44"
  ligne-data: "#1d57c4"
  ligne-ink: "#ffffff"
  support: "#ffc21a"
  support-ink: "#0b0e13"
  signe: "#0b0e13"
  signe-ink: "#f3f4f6"
  signe-muted: "#aeb5c0"
  paper-dark: "#0b0e13"
  surface-dark: "#151a21"
  ink-dark: "#eef0f3"
  muted-dark: "#a7afbb"
  faint-dark: "#8a93a0"
  ligne-sites-dark: "#f26a4b"
  ligne-web-dark: "#b27fe0"
  ligne-mobile-dark: "#43c07e"
  ligne-data-dark: "#6c9cf2"
  signe-dark: "#eef0f3"
  signe-muted-dark: "#454b56"
typography:
  display:
    fontFamily: "Barlow Condensed, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(3.1rem, 6vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "0.004em"
  headline:
    fontFamily: "Barlow Condensed, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(3rem, 5vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.94
  title:
    fontFamily: "Barlow Condensed, Segoe UI, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 0.94
  body:
    fontFamily: "Barlow, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Barlow Condensed, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "6px"
  station: "9999px"
spacing:
  section: "8.5rem"
  row: "2rem"
  gutter: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.ligne-web}"
    textColor: "{colors.ligne-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 32px"
    height: "54px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 32px"
    height: "54px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  placard:
    backgroundColor: "{colors.signe}"
    textColor: "{colors.signe-ink}"
  nav-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  station:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.station}"
    size: "28px"
---

# Design System: BLF Lab's

## Overview

**Creative North Star: "Le plan de ligne"**

Le site se lit comme la signalétique d'une ligne de transport. Un projet est un trajet de quatre stations, cadrage, maquette, développement, remise des clés, et le terminus est l'offre elle-même : le code, le nom de domaine et les accès transférés au nom du client. Tout ce qui se voit découle de cette métaphore et d'aucune autre : des traits de ligne épais à bouts arrondis, des pastilles de station, des noms de station en capitales condensées, des placards pleins.

La matière est celle du panneau émaillé : un fond, un panneau, une encre, et rien entre les deux. Aucune ombre, aucun dégradé, aucun verre. La couleur n'est jamais décorative : les quatre couleurs de ligne désignent chacune une famille d'offre, sur toutes les pages, et l'action principale porte le violet de la ligne web, qui est celui de l'apostrophe du logo. La densité est calme : rangées réglées plutôt que grilles de cartes, beaucoup d'espace entre les sections.

La direction précédente, "laboratoire" (grille millimétrée, fiole 3D, violet clair et citron, Archivo), est l'anti-référence explicite.

**Key Characteristics:**
- Un trait de ligne épais (6 px, bouts ronds) qui relie des pastilles de station (anneau d'encre de 5 px, cœur de panneau).
- Placards en Barlow Condensed 800 capitales ; texte en Barlow.
- Quatre couleurs de ligne, une par offre, jamais en décor.
- États francs : allumé ou éteint, jamais de demi-teinte.
- Un seul changement de fond par page, le placard de fin de page.

## Colors

Une palette de signalétique : neutres froids, quatre teintes de ligne saturées, un jaune de signalisation.

### Primary
- **Violet de la ligne web** (`ligne-web`, #7a2fa3 en clair, #b27fe0 en sombre) : l'action principale ("Démarrer un projet"), le trait sous le mot mis en avant d'un titre, la ligne de la méthode et du hero, la pastille du terminus. C'est aussi la famille "Applications web et SaaS".

### Secondary
- **Vermillon** (`ligne-sites`, #c93418 / #f26a4b) : famille "Sites et boutiques".
- **Vert** (`ligne-mobile`, #127a44 / #43c07e) : famille "Applications mobiles".
- **Bleu** (`ligne-data`, #1d57c4 / #6c9cf2) : famille "Data, IA et automatisation".

### Tertiary
- **Jaune de signalisation** (`support`, #ffc21a) : sélection de texte, message d'erreur, trait sous le mot mis en avant sur un placard. Jamais en aplat large sur le fond clair.

### Neutral
- **Gris de quai** (`paper`, #f3f4f6 / #0b0e13) : le fond de page.
- **Émail** (`surface`, #ffffff / #151a21) : panneaux, barre de navigation, champs, pastilles de station.
- **Encre** (`ink`, #0b0e13 / #eef0f3) : texte et anneaux des pastilles.
- **Encre atténuée** (`muted`, #454b56 / #a7afbb) et **discrète** (`faint`, #5e6571 / #8a93a0) : texte courant secondaire, étiquettes, fil d'Ariane.
- **Placard** (`signe`, #0b0e13 en clair, #eef0f3 en sombre) : bandeau de fin de page et en-tête de la Ligne BLF. Il s'inverse d'un thème à l'autre.

### Named Rules
**The One Line, One Offer Rule.** Une couleur de ligne désigne toujours la même famille d'offre. Elle ne sert jamais à décorer une section qui n'en parle pas ; seule la bande des quatre lignes les montre ensemble.

**The Dedicated Ink Rule.** Un aplat porte son encre dédiée (`accent-ink`, `support-ink`, `ligne-ink`, `signe-ink`), jamais `ink`, qui s'inverse avec le thème. `ligne-ink` est blanc en clair et noir en sombre, parce que les teintes de ligne s'éclaircissent en sombre.

**The Two Surfaces Rule.** Un fond et un panneau par thème. Pas de troisième surface ; `surface-strong` pointe sur `paper`.

## Typography

**Display Font:** Barlow Condensed (Segoe UI, system-ui)
**Body Font:** Barlow (Segoe UI, system-ui)

**Character:** Une seule famille en deux chasses, comme un système de signalétique : la condensée parle en noms de station, la normale explique. Fichiers locaux dans `public/fonts`, sous-ensemble latin, aucun CDN.

### Hierarchy
- **Display** (800, 3.1rem à 5.4rem, 0.94, capitales) : le H1 de l'accueil.
- **Headline** (800, 3rem à 4.5rem, 0.94, capitales) : titres de section et H1 des pages intérieures.
- **Title** (800, 1.5rem à 2.25rem, 0.94, capitales) : noms de station, offres, lignes de correspondance.
- **Body** (400, 17px, 1.625) : texte courant, mesure limitée à `max-w-xl` / `max-w-2xl`.
- **Label** (700, 14px à 16px, 0.08em, capitales condensées) : navigation, étiquettes de placard, fil d'Ariane, "En savoir plus".

### Named Rules
**The Station Name Rule.** Tout ce qui nomme un lieu du site (titre, offre, étape, entrée de navigation) est en capitales condensées. Tout ce qui explique reste en Barlow normale. Une question entière de la FAQ n'est pas un nom de station : elle reste en texte courant.

**The Underline, Not Recolor Rule.** Un mot mis en avant dans un titre garde l'encre du titre ; la couleur passe dans un trait de 0.11em dessous (violet sur le fond, jaune sur un placard).

## Layout

Conteneur de 72rem (`max-w-6xl`) avec gouttière de 1rem à 2rem. Sections séparées par 8.5rem de padding vertical et un filet d'1 px. Le hero est en 12 colonnes : titre et actions sur 7, Ligne BLF sur 5 ; sur téléphone, la ligne suit les actions. Les listes de contenu sont des rangées réglées (filet haut, 2rem à 3rem de padding vertical) en grille 4 / 8 ou 5 / 7, plutôt que des cartes. La méthode est horizontale sur 4 colonnes au-dessus de `lg`, verticale en dessous. Les pages intérieures laissent 9rem sous la barre de navigation fixe.

## Elevation & Depth

Aucune ombre. Le système est plat, à la manière d'un panneau émaillé : la profondeur se lit au trait (filet d'1 px, renforcé à 36 % d'opacité quand la barre de navigation survole du contenu) et au changement franc de fond du placard. Les jetons `--shadow` et `--shadow-sm` valent `none`.

### Named Rules
**The Enamel Rule.** Rien ne flotte. Pas de lévitation au survol, pas de halo, pas de verre ; un bouton s'enfonce (`scale(0.97)`) et s'éclaircit légèrement, il ne se soulève pas.

## Shapes

Deux formes seulement : l'angle court de la plaque (6 px pour boutons et panneaux principaux, 4 px pour les petits panneaux) et le rond de la station (pastilles, bouts de ligne). Les traits de ligne font 6 px d'épaisseur avec des bouts entièrement arrondis ; les anneaux de station font 5 px (4 px sur la bande des quatre lignes, 3 px sur le rail du formulaire).

## Components

### Buttons
- **Shape:** plaque à angle court (6px), hauteur 54px sur les appels principaux.
- **Primary:** aplat violet de ligne web, encre dédiée, placard condensé en capitales.
- **Hover / Focus:** éclaircissement de 8 % sur pointeur fin uniquement ; appui en `scale(0.97)` en 160ms `ease-snap`. Focus : contour de 3px en encre, décalé de 3px.
- **Ghost:** trait de 2px en encre (ou `border-current` sur un placard), fond transparent.

### Navigation
- **Style:** barre pleine émaillée, trait d'1 px, rayon 6px, flottante à 1rem du haut, se retire au défilement vers le bas.
- **Items:** étiquettes condensées ; au survol un trait violet de 3px se déploie de gauche à droite en 200ms.
- **Current:** la page courante passe en placard plein (fond encre, texte fond de page), avec `aria-current="page"`.
- **Mobile:** menu déroulant en texte courant, bouton d'action pleine largeur.

### Cards / Containers
- **Corner Style:** 4px (`blk`), 6px pour la Ligne BLF.
- **Background:** émail (`surface`).
- **Shadow Strategy:** aucune, voir Elevation & Depth.
- **Border:** 1px en `line`.

### Inputs / Fields
- **Style:** panneau émaillé, trait d'1 px, rayon 4px.
- **Focus:** contour de 3px en encre.
- **Error:** aplat jaune de signalisation avec son encre dédiée.

### Ligne BLF (signature)
Figure du hero : un placard d'en-tête ("Ligne BLF", "Direction remise des clés"), puis trois stations (pastille de 28px, anneau d'encre de 5px) reliées par un trait violet vertical, et le terminus "Remise des clés" en pastille pleine de 44px avec une clé Phosphor, suivi de ce qui est transféré. Chaque station trace son propre segment, sans hauteur calculée. Au chargement, le trait se dessine (`scaleY`, 380ms) et les pastilles s'allument (`scale` depuis 0.55, 260ms), décalés de 190ms par station ; le texte ne bouge jamais et le mouvement réduit montre l'état final.

### Bande des quatre lignes (signature)
Séparateur en tête des grandes sections, du placard de fin de page et du pied de page : les quatre traits de ligne bout à bout, séparés par trois stations en `border-current`, sans variante de thème.

### Offre en ligne
Rangée réglée : pastille de 56px à la couleur de la ligne avec pictogramme Phosphor en `ligne-ink`, nom de l'offre en placard, puis les outils posés comme stations sur un trait de la couleur de ligne.

### Chips
- **Style:** étiquettes de technologies des réalisations, trait d'1 px, rayon 4px, texte 12px atténué.

## Do's and Don'ts

### Do:
- **Do** relier ce qui se suit par un trait de ligne de 6px et des pastilles de station, du centre d'une pastille au centre de la suivante.
- **Do** donner à chaque famille d'offre sa couleur de ligne, et seulement à elle.
- **Do** mettre en avant un mot de titre par un trait dessous, violet sur le fond, jaune sur un placard.
- **Do** passer l'état courant en placard plein, sans demi-teinte.
- **Do** mesurer chaque encre contre son propre fond dans les deux thèmes (`app/accessibilite.test.ts`).

### Don't:
- **Don't** poser d'ombre, de dégradé, de verre ni de flou décoratif.
- **Don't** reprendre la grille millimétrée, la fiole 3D, le citron ou Archivo de la direction "laboratoire".
- **Don't** construire une section en grille de cartes identiques icône, titre, texte : utiliser des rangées réglées.
- **Don't** poser de surtitre au-dessus d'un titre.
- **Don't** recolorer un mot de titre.
- **Don't** redessiner, recoloriser ou régénérer le logo : ce sont les fichiers fournis dans `public/brand`.
