import type { Metadata } from "next";
import { DirectionPreview } from "./DirectionPreview";

// Page de travail interne : elle ne doit apparaitre dans aucun moteur.
export const metadata: Metadata = {
  title: "Comparateur de directions artistiques",
  robots: { index: false, follow: false },
};

export default function DesignPreviewPage() {
  return <DirectionPreview />;
}
