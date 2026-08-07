"""Convertit les captures de projets en WebP pour le site.

Pourquoi : une capture PNG de 1280 px pese plusieurs centaines de kilo-octets,
et le site en affiche une par realisation. En WebP a qualite 82, on divise le
poids par cinq a l'oeil nu identique, ce qui evite de faire payer la page
d'accueil au visiteur mobile.

Les captures sont prises sur les projets d'Adam lui-meme (bacchana.beloucif.com,
ohynozen.com) : aucune image de tiers n'est reprise.

Usage : python scripts/optimize_shots.py
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit(
        "Pillow est requis pour cette conversion. Installer avec :\n"
        "  python -m pip install Pillow"
    )

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "shots"

# Fichier source -> nom de sortie, aligne sur le slug de content/references.ts
SHOTS = {
    "shot-bacchana.png": "bacchana.webp",
    "shot-ohynozen.png": "ohynozen.webp",
}

# Largeur d'affichage maximale d'une carte de realisation, doublee pour les
# ecrans a haute densite.
TARGET_WIDTH = 1200


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    done = 0

    for source_name, target_name in SHOTS.items():
        source = ROOT / source_name
        if not source.exists():
            print(f"IGNORE : {source_name} absent")
            continue

        image = Image.open(source).convert("RGB")

        if image.width > TARGET_WIDTH:
            height = round(image.height * TARGET_WIDTH / image.width)
            image = image.resize((TARGET_WIDTH, height), Image.LANCZOS)

        target = OUT_DIR / target_name
        image.save(target, "WEBP", quality=82, method=6)

        before = source.stat().st_size // 1024
        after = target.stat().st_size // 1024
        print(f"{target_name} : {before} Ko -> {after} Ko ({image.width}x{image.height})")
        done += 1

    if not done:
        sys.exit("Aucune capture convertie.")

    print(f"\n{done} capture(s) ecrite(s) dans public/shots")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
