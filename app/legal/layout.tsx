import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Cadre commun aux pages légales.
 *
 * Les styles de texte sont poses ici une fois pour toutes plutot que repetes
 * dans chaque page : les trois documents doivent se lire de la meme facon.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>
        <div className="section mx-auto max-w-3xl px-5">
          <div
            className="[&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h3]:mt-8 [&_h3]:text-lg [&_li]:leading-relaxed [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-muted"
          >
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
