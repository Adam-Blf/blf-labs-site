import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HomeSections } from "@/components/marketing/HomeSections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
