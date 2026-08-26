import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Faq } from "@/components/marketing/Faq";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Prix, délais, propriété du code, suivi après la mise en ligne, TVA : les questions posées avant de commander un projet.",
  alternates: { canonical: "/questions" },
};

export default function QuestionsPage() {
  return (
    <>
      <Header />
      <FaqJsonLd />
      <main id="contenu" className="pt-24">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <Breadcrumb miettes={[{ nom: "Questions fréquentes" }]} />
        </div>
        <Faq niveau={1} />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
