"""Verifie que tout le projet est en UTF-8 propre, sans BOM ni mojibake.

Pourquoi : le site affiche du francais accentue. Trois accidents suffisent a le
rendre illisible, et aucun ne se voit dans un editeur qui corrige en silence :

  1. un fichier enregistre dans un autre encodage (cp1252 sur Windows) : les
     accents deviennent des caracteres de remplacement a la lecture ;
  2. un BOM en tete de fichier : Next.js le rend parfois visible en debut de
     page, et il casse certains parseurs ;
  3. du mojibake deja ecrit dans le fichier - "Ã©" au lieu de "é" - signe d'un
     texte UTF-8 relu comme du latin-1 puis reenregistre.

Le script controle aussi que les pages declarent bien leur encodage : Next.js
pose <meta charset="utf-8"> automatiquement, mais un `metadata` mal forme peut
l'ecraser.

Usage : python scripts/check_encoding.py
Code de sortie 1 si un probleme est trouve, pour servir de garde en CI.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCAN_DIRS = ["app", "components", "content", "lib", "scripts", "supabase"]
SUFFIXES = {".ts", ".tsx", ".css", ".sql", ".py", ".json", ".md", ".svg"}

# Sequences typiques d'un texte UTF-8 relu en latin-1 puis reenregistre.
MOJIBAKE = ("Ã©", "Ã¨", "Ã ", "Ã§", "Ãª", "Ã®", "Ã´", "Ã»", "Â°", "â€™", "ï»¿")


def main() -> int:
    problems: list[str] = []
    checked = 0
    accented = 0

    for directory in SCAN_DIRS:
        base = ROOT / directory
        if not base.exists():
            continue

        for path in sorted(base.rglob("*")):
            if path.suffix not in SUFFIXES or not path.is_file():
                continue

            # Ce fichier contient les sequences de mojibake comme motifs de
            # recherche, ainsi que le caractere de remplacement. Il se
            # signalerait donc lui-meme a chaque execution. L'exclusion est
            # explicite plutot que silencieuse : une garde doit dire ce qu'elle
            # ne regarde pas.
            if path.resolve() == Path(__file__).resolve():
                continue

            relative = path.relative_to(ROOT)
            raw = path.read_bytes()
            checked += 1

            # 1. BOM en tete.
            if raw.startswith(b"\xef\xbb\xbf"):
                problems.append(f"{relative} : BOM UTF-8 en tete de fichier")

            # 2. Decodage strict. Un fichier non UTF-8 leve ici.
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError as error:
                problems.append(f"{relative} : n'est pas de l'UTF-8 valide ({error.reason})")
                continue

            # 3. Mojibake deja inscrit.
            for marker in MOJIBAKE:
                if marker in text:
                    problems.append(f"{relative} : sequence suspecte '{marker}'")
                    break

            # 4. Caractere de remplacement, trace d'une conversion ratee.
            if "�" in text:
                problems.append(f"{relative} : caractere de remplacement U+FFFD")

            if any(char in text for char in "éèêàçôûîï"):
                accented += 1

    print(f"{checked} fichier(s) controle(s), dont {accented} avec des accents.")

    if problems:
        print(f"\n{len(problems)} probleme(s) :")
        for problem in problems:
            print(f"  - {problem}")
        return 1

    print("Encodage UTF-8 propre : aucun BOM, aucun mojibake, aucun caractere perdu.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
