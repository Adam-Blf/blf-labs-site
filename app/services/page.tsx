import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
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
      <main className="pt-24">
        <OffreGrid />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
