import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { CtaBand } from "@/components/marketing/CtaBand";
import { OffreGrid } from "@/components/marketing/OffreGrid";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Sites et boutiques, applications web et SaaS, applications mobiles, data et IA. Les quatre familles de projets pris en charge par BLF Lab's.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="pt-24">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <Breadcrumb miettes={[{ nom: "Services" }]} />
        </div>
        <OffreGrid />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
