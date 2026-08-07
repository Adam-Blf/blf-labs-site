import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
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
        <Methode />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
