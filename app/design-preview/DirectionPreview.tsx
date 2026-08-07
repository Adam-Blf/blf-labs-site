"use client";

import { useState } from "react";
import { DIRECTIONS } from "@/content/directions";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HomeSections } from "@/components/marketing/HomeSections";
import { LogoBoard } from "./LogoBoard";

/**
 * Comparateur des huit directions artistiques.
 *
 * Page de travail, retiree du site des que le choix est fait. Elle rejoue la
 * VRAIE page d'accueil (meme composants, meme contenu) : comparer huit vignettes
 * inventees pour l'occasion ne dirait rien de ce que donnera le site.
 */
export function DirectionPreview() {
  const [direction, setDirection] = useState(DIRECTIONS[0].id);
  const [dark, setDark] = useState(false);
  const [showLogos, setShowLogos] = useState(false);

  const current =
    DIRECTIONS.find((item) => item.id === direction) ?? DIRECTIONS[0];

  return (
    <div className="dir-brut min-h-screen bg-paper">
      {/* Barre de pilotage volontairement neutre : elle ne doit pas influencer
          le jugement porte sur la direction affichee en dessous. */}
      <div className="sticky top-0 z-[60] rule-b bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-3">
          {DIRECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setDirection(item.id);
                setShowLogos(false);
              }}
              aria-pressed={direction === item.id && !showLogos}
              className={`mono blk-flat min-h-[44px] px-3 py-2 text-xs uppercase ${
                direction === item.id && !showLogos
                  ? "bg-accent text-accent-ink"
                  : "bg-paper text-ink"
              }`}
            >
              {item.code} {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowLogos((value) => !value)}
            aria-pressed={showLogos}
            className={`mono blk-flat ml-2 min-h-[44px] px-3 py-2 text-xs uppercase ${
              showLogos ? "bg-support text-support-ink" : "bg-paper text-ink"
            }`}
          >
            Logos
          </button>

          <button
            type="button"
            onClick={() => setDark((value) => !value)}
            className="mono blk-flat ml-auto min-h-[44px] bg-paper px-3 py-2 text-xs uppercase"
          >
            {dark ? "Voir en clair" : "Voir en sombre"}
          </button>
        </div>

        <p className="mx-auto max-w-6xl px-5 pb-3 text-sm text-muted">
          <span className="mono font-bold">
            {current.code} {current.label}
          </span>{" "}
          {current.note}
        </p>
      </div>

      {/* Le conteneur porte la direction ET le theme : les tokens sont
          redefinis ici, tout ce qui est en dessous suit. */}
      <div className={`${direction} ${dark ? "dark" : ""} bg-paper text-ink`}>
        {showLogos ? (
          <LogoBoard />
        ) : (
          <>
            <Header sticky={false} />
            <HomeSections />
            <Footer />
          </>
        )}
      </div>
    </div>
  );
}
