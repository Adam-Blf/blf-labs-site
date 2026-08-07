"use client";

import { useState } from "react";
import { HomeSections } from "@/components/marketing/HomeSections";

/**
 * Comparateur des trois palettes candidates.
 *
 * Page de travail, retiree du site des que le choix est fait. Elle rejoue la
 * VRAIE page d'accueil (meme composant, meme contenu) : comparer trois vignettes
 * inventees pour l'occasion ne dit rien de ce que donnera le site.
 */

const PALETTES = [
  {
    id: "pal-navy",
    label: "A - Navy et laiton",
    note: "Les couleurs de vos badges GitHub. Sobre, chic, reconnaissable.",
  },
  {
    id: "pal-klein",
    label: "B - Bleu Klein et corail",
    note: "Blanc franc, contraste eleve. Registre studio de design.",
  },
  {
    id: "pal-acid",
    label: "C - Acide",
    note: "Vert acide et magenta. Le plus punchy, le plus jeune.",
  },
] as const;

export function PalettePreview() {
  const [palette, setPalette] = useState<string>(PALETTES[0].id);
  const [dark, setDark] = useState(false);

  const current = PALETTES.find((item) => item.id === palette) ?? PALETTES[0];

  return (
    <div className="pal-navy min-h-screen bg-paper">
      {/* Barre de pilotage, volontairement neutre : elle ne doit pas influencer
          le jugement sur la palette affichee en dessous. */}
      <div className="sticky top-0 z-[60] border-b-[3px] border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Choix de palette
          </span>

          <div className="flex flex-wrap gap-2">
            {PALETTES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPalette(item.id)}
                aria-pressed={palette === item.id}
                className={`min-h-[44px] border-[3px] border-line px-4 py-2 font-mono text-xs uppercase ${
                  palette === item.id
                    ? "bg-accent text-accent-ink"
                    : "bg-paper text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDark((value) => !value)}
            className="ml-auto min-h-[44px] border-[3px] border-line bg-paper px-4 py-2 font-mono text-xs uppercase"
          >
            {dark ? "Voir en clair" : "Voir en sombre"}
          </button>
        </div>

        <p className="mx-auto max-w-6xl px-5 pb-3 text-sm text-muted">
          {current.note}
        </p>
      </div>

      {/* Le wrapper porte la palette ET le theme : les variables sont
          redefinies ici, tout ce qui est en dessous suit. */}
      <div className={`${palette} ${dark ? "dark" : ""} bg-paper text-ink`}>
        <HomeSections />
      </div>
    </div>
  );
}
