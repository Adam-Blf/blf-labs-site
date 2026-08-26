import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { CtaBand } from "@/components/marketing/CtaBand";
import { ReferencesSection } from "@/components/marketing/ReferencesSection";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Les projets livrés par BLF Lab's : Bacchana, application de jeu publiée sur le web, iOS et Android, et Ohypnozen, site vitrine livré pour un cabinet de thérapie.",
  alternates: { canonical: "/references" },
};

export default function ReferencesPage() {
  return (
    <>
      <Header />
      <main id="contenu">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <Breadcrumb miettes={[{ nom: "Réalisations" }]} />
        </div>
        {/* `compact` reste faux ici : la page dediee montre le detail de chaque
            projet, la version courte est reservee a l'accueil. */}
        <ReferencesSection niveau={1} />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
