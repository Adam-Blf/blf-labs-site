"""Allege un SVG exporte par un outil de design avant de le servir sur le web.

Un export Canva embarque un bloc <metadata> C2PA (provenance du fichier, signee
en base64) qui pese ici plus de 25 Ko, soit un tiers du fichier, pour une donnee
qu'aucun navigateur n'affiche. Le meme fichier porte aussi des attributs
d'editeur sans effet au rendu.

Ce script ne touche PAS au trace : il ne supprime que des noeuds de metadonnees
et des attributs decoratifs. La taille avant / apres est affichee pour que la
difference soit verifiable.

Usage :
  python scripts/clean_svg.py <entree.svg> [sortie.svg]
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def clean(svg: str) -> str:
    # Provenance C2PA : volumineuse, inutile au rendu.
    svg = re.sub(r"<metadata>.*?</metadata>", "", svg, flags=re.S)
    # Marqueur ajoute par l'outil, sans effet.
    svg = re.sub(r"<ContainsAiGeneratedContent>.*?</ContainsAiGeneratedContent>", "", svg, flags=re.S)
    # Attributs d'editeur : le navigateur applique deja ces valeurs par defaut.
    svg = re.sub(r'\s+zoomAndPan="[^"]*"', "", svg)
    svg = re.sub(r'\s+version="[^"]*"', "", svg)
    # Commentaires d'export.
    svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S)
    # Espaces laisses par les suppressions.
    svg = re.sub(r">\s+<", "><", svg)
    return svg.strip() + "\n"


def main() -> int:
    if len(sys.argv) < 2:
        sys.exit("Usage : python scripts/clean_svg.py <entree.svg> [sortie.svg]")

    source = Path(sys.argv[1])
    target = Path(sys.argv[2]) if len(sys.argv) > 2 else source

    if not source.exists():
        sys.exit(f"Fichier introuvable : {source}")

    original = source.read_text(encoding="utf-8")
    cleaned = clean(original)

    before = len(original.encode("utf-8"))
    after = len(cleaned.encode("utf-8"))

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(cleaned, encoding="utf-8")

    print(f"{source.name} : {before // 1024} Ko -> {after // 1024} Ko "
          f"({100 - after * 100 // max(before, 1)} % de gain)")
    print(f"Ecrit : {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
