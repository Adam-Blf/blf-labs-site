import type { Metadata } from "next";
import { PalettePreview } from "./PalettePreview";

// Page de travail interne : elle ne doit apparaitre dans aucun moteur.
export const metadata: Metadata = {
  title: "Comparateur de palettes",
  robots: { index: false, follow: false },
};

export default function DesignPreviewPage() {
  return <PalettePreview />;
}
