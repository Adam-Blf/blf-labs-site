import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
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
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <Breadcrumb miettes={[{ nom: "Réalisations" }]} />
        </div>
        {/* `compact` reste faux ici : la page dediee montre le detail de chaque
            projet, la version courte est reservee a l'accueil. */}
        <ReferencesSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
