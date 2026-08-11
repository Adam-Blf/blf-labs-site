"""Produit la police statique utilisee pour generer la carte de partage.

Pourquoi ce fichier existe separement des polices du site : il n'est PAS servi
au navigateur. Il sert uniquement au build, a Satori, le moteur derriere
`ImageResponse` de Next. Le ranger dans public/fonts inviterait a le charger par
erreur dans une page, alors qu'il pese plusieurs fois le poids du woff2.

Pourquoi une conversion et pas un telechargement : Satori ne lit ni le woff2 ni
les polices variables, il lui faut un TTF statique a une seule graisse. Google
Fonts ne sert plus de TTF, meme a un vieux user-agent - la premiere version de
ce script comptait dessus et echouait. On part donc du woff2 deja versionne dans
le depot, ce qui a un avantage supplementaire : la generation ne depend d'aucun
reseau, ni au build ni ici. Un deploiement ne peut pas echouer parce qu'un
service tiers est tombe.

Deux operations, dans cet ordre :
  1. decompression du woff2 en TTF (fontTools + brotli) ;
  2. instanciation de l'axe de graisse a 800, parce qu'Archivo est variable et
     que Satori ignorerait l'axe et rendrait la graisse par defaut.

Usage : python scripts/fetch_og_font.py
Prerequis : pip install fonttools brotli
"""

from __future__ import annotations

import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "public" / "fonts" / "archivo-400-900-latin.woff2"
DESTINATION = RACINE / "assets" / "archivo-800.ttf"
# Archivo a DEUX axes : la graisse et la largeur. N'en figer qu'un laisse la
# police variable - les tables fvar et gvar restent presentes - et Satori
# echoue alors au rendu sur une erreur d'index incomprehensible. Il faut donc
# epingler TOUS les axes, sans exception.
#
# La largeur 118 est celle des titres du site (--title-width), pour que la
# carte de partage porte la meme signature typographique que les pages.
AXES = {"wght": 800, "wdth": 118}


def main() -> int:
    if not SOURCE.exists():
        print(f"ECHEC : {SOURCE.relative_to(RACINE)} est absent.")
        print("Lancer d'abord : python scripts/fetch_fonts.py")
        return 1

    try:
        from fontTools.ttLib import TTFont
        from fontTools.varLib import instancer
    except ImportError:
        print("ECHEC : fontTools est requis. pip install fonttools brotli")
        return 1

    police = TTFont(SOURCE)

    if "fvar" in police:
        # On epingle chaque axe declare par la police, en prenant la valeur
        # demandee quand on en a une et la valeur par defaut sinon. Un axe
        # oublie suffit a laisser la police variable.
        cibles = {
            axe.axisTag: AXES.get(axe.axisTag, axe.defaultValue)
            for axe in police["fvar"].axes
        }
        # `updateFontNames` reste a False : il exigerait que la table STAT
        # declare une valeur nommee pour chaque coordonnee epinglee, ce qui
        # n'est pas le cas de la largeur 118. Le nom interne de la police n'a
        # aucune importance ici, c'est celui passe a Satori qui compte.
        police = instancer.instantiateVariableFont(police, cibles)

        restantes = [t for t in ("fvar", "gvar", "avar", "HVAR") if t in police]
        if restantes:
            print("ECHEC : la police est restee variable, tables " + ", ".join(restantes))
            return 1

    # `flavor` a None : on ecrit un TTF nu, sans conteneur de compression web.
    police.flavor = None

    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    police.save(DESTINATION)

    poids = DESTINATION.stat().st_size / 1024
    axes = ", ".join(f"{k} {v}" for k, v in AXES.items())
    print(f"OK : {DESTINATION.relative_to(RACINE)} ({poids:.0f} Ko, {axes})")
    print(f"     depuis {SOURCE.relative_to(RACINE)}, sans acces reseau")
    return 0


if __name__ == "__main__":
    sys.exit(main())
