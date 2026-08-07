import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Faq } from "@/components/marketing/Faq";

export const metadata: Metadata = {
  title: "Questions frequentes",
  description:
    "Prix, délais, propriété du code, suivi après la mise en ligne, TVA : les questions posees avant de commander un projet.",
  alternates: { canonical: "/questions" },
};

export default function QuestionsPage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
