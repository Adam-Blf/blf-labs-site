import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Les projets livres par BLF Lab's : Bacchana, application de jeu publiee sur le web, iOS et Android, et Ohynozen, site vitrine livre pour un cabinet de therapie.",
  alternates: { canonical: "/references" },
};

export default function ReferencesPage() {
  return (
    <>
      <Header />
      <main>
        {/* `compact` reste faux ici : la page dediee montre le detail de chaque
            projet, la version courte est reservee a l'accueil. */}
        <ReferencesSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
