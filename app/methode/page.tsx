import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Methode } from "@/components/marketing/Methode";

export const metadata: Metadata = {
  title: "Méthode",
  description:
    "Cadrage, maquette, developpement, remise des cles : comment se deroule un projet confie a BLF Lab's.",
  alternates: { canonical: "/methode" },
};

export default function MethodePage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <Breadcrumb miettes={[{ nom: "Méthode" }]} />
        </div>
        <Methode />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
