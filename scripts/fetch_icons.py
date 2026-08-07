"""Rapatrie les pictogrammes Icons8 et les transforme en composant React local.

Pourquoi ce script existe :
  - Regle d'assets locaux : aucune app livree ne charge une image depuis un CDN.
    Un `<img src="https://img.icons8.com/...">` casse sur un poste isole et
    ouvre un flux sortant qu'une DSI refusera.
  - Regle icones : les pictogrammes viennent d'Icons8, pas de lucide-react ni
    d'un dessin improvise.
  - Un `<img>` ne suit pas la couleur du theme. En generant du JSX avec
    `currentColor`, les icones basculent avec le theme clair / sombre.

SECRETS : la cle Icons8 n'est ni dans ce fichier ni dans le depot. Elle est lue
dans un fichier d'environnement externe et n'est jamais affichee.

Usage : python scripts/fetch_icons.py
Le fichier d'environnement est cherche dans cet ordre, premier existant retenu :
  1. la variable ICONS8_ENV_FILE
  2. C:/Users/adamb/Desktop/.env          (fichier dedie Icons8 + OVH)
  3. C:/Users/adamb/Desktop/bacchana.env  (repli historique)
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ENV_CANDIDATES = (
    Path("C:/Users/adamb/Desktop/.env"),
    Path("C:/Users/adamb/Desktop/bacchana.env"),
)
API = "https://api-icons.icons8.com/publicApi/icons/icon"


def resolve_env_file() -> Path:
    """Premier fichier d'environnement existant, sans jamais lire son contenu."""
    override = os.environ.get("ICONS8_ENV_FILE")
    if override:
        return Path(override)
    for candidate in ENV_CANDIDATES:
        if candidate.exists():
            return candidate
    sys.exit(
        "Aucun fichier d'environnement trouve. Emplacements essayes : "
        + ", ".join(str(path) for path in ENV_CANDIDATES)
    )

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "components" / "icons" / "OffreIcons.tsx"

# Style "fluent-systems-regular" : traits fins, sans remplissage, coherent avec
# la direction artistique retenue (angles adoucis, aucun aplat lourd).
ICONS: dict[str, dict[str, str]] = {
    "SitesWeb": {"id": "1TDc8e31sEKT", "name": "Website"},
    "AppsWeb": {"id": "njaJpaYpR50I", "name": "Web Apps"},
    "AppsMobiles": {"id": "SeACxSbSXpUE", "name": "Smartphone"},
    "DataIa": {"id": "CL9FYPTHMfLp", "name": "Database"},
}


def load_key(env_file: Path) -> str:
    if not env_file.exists():
        sys.exit(f"Fichier d'environnement introuvable : {env_file}")
    for raw in env_file.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if line.startswith("ICONS8_API_KEY=") and "=" in line:
            return line.partition("=")[2].strip().strip('"').strip("'")
    sys.exit("ICONS8_API_KEY absente du fichier d'environnement")


def fetch_svg(icon_id: str, token: str) -> str:
    query = urllib.parse.urlencode({"id": icon_id, "format": "svg", "token": token})
    try:
        with urllib.request.urlopen(f"{API}?{query}", timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        # On n'imprime jamais l'URL : elle porte le jeton.
        sys.exit(f"Icons8 a refuse l'icone {icon_id} (HTTP {error.code})")

    icon = payload.get("icon") or {}
    # Le nom du champ portant le SVG a change au fil des versions de l'API :
    # on essaie les variantes connues plutot que d'en supposer une.
    for field in ("svg", "svgPreview", "vector", "content"):
        value = icon.get(field)
        if isinstance(value, str) and "<svg" in value:
            return value

    available = ", ".join(sorted(icon.keys()))
    sys.exit(
        f"Aucun champ SVG pour l'icone {icon_id}. Champs recus : {available}"
    )


def to_jsx(svg: str) -> str:
    """Reduit le SVG a son contenu, en couleur heritee du theme."""
    inner = re.sub(r"^.*?<svg[^>]*>", "", svg, flags=re.S)
    inner = re.sub(r"</svg>\s*$", "", inner, flags=re.S)

    # Icons8 sert des couleurs en dur : on les remplace par currentColor pour
    # que l'icone suive l'encre du theme.
    inner = re.sub(r'fill="(?!none)[^"]*"', 'fill="currentColor"', inner)
    inner = re.sub(r'stroke="(?!none)[^"]*"', 'stroke="currentColor"', inner)

    # Attributs SVG vers leur equivalent JSX.
    for svg_attr, jsx_attr in (
        ("fill-rule", "fillRule"),
        ("clip-rule", "clipRule"),
        ("stroke-width", "strokeWidth"),
        ("stroke-linecap", "strokeLinecap"),
        ("stroke-linejoin", "strokeLinejoin"),
        ("clip-path", "clipPath"),
        ("stroke-miterlimit", "strokeMiterlimit"),
    ):
        inner = inner.replace(f"{svg_attr}=", f"{jsx_attr}=")

    return " ".join(inner.split())


def view_box(svg: str) -> str:
    found = re.search(r'viewBox="([^"]+)"', svg)
    return found.group(1) if found else "0 0 32 32"


def main() -> int:
    env_file = resolve_env_file()
    token = load_key(env_file)

    blocks: list[str] = []
    for component, meta in ICONS.items():
        svg = fetch_svg(meta["id"], token)
        blocks.append(
            # fill="currentColor" sur la racine : les traces Icons8 n'ont
            # souvent aucun attribut de couleur et tomberaient en noir, donc
            # invisibles en theme sombre.
            f'export function Icon{component}({{ className = "" }}: IconProps) {{\n'
            f"  return (\n"
            f'    <svg viewBox="{view_box(svg)}" className={{className}} fill="currentColor" aria-hidden="true">\n'
            f"      {to_jsx(svg)}\n"
            f"    </svg>\n"
            f"  );\n"
            f"}}"
        )
        print(f"  - Icon{component} depuis Icons8 ({meta['name']})")

    header = (
        "/**\n"
        " * FICHIER GENERE - ne pas modifier a la main.\n"
        " * Source : python scripts/fetch_icons.py (pictogrammes Icons8).\n"
        " *\n"
        " * Les icones sont inlinees plutot que chargees en <img> depuis le CDN\n"
        " * Icons8 : aucune requete sortante, et le trace suit `currentColor`,\n"
        " * donc la couleur du theme clair ou sombre.\n"
        " */\n\n"
        "type IconProps = { className?: string };\n\n"
    )

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(header + "\n\n".join(blocks) + "\n", encoding="utf-8")
    print(f"Ecrit : {OUT_FILE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
