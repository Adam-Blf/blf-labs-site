import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OrderForm } from "@/components/order/OrderForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Commander un projet",
  description:
    "Decrivez votre projet en quelques minutes. Vous recevez une réponse avec une estimation de budget et de délai.",
  alternates: { canonical: "/commander" },
};

// Next 16 : searchParams est une promesse au meme titre que params.
type PageProps = { searchParams: Promise<{ offre?: string }> };

export default async function CommanderPage({ searchParams }: PageProps) {
  const { offre } = await searchParams;

  return (
    <>
      <Header />

      <main className="pt-28">
        <section>
          <div className="section mx-auto max-w-3xl px-5">
            <h1 className="title text-4xl md:text-6xl">Commander un projet</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Trois étapes, cinq minutes. Vous recevez une réponse avec une
              estimation de budget et de délai, ou une orientation ailleurs si ce
              n&rsquo;est pas pour nous.
            </p>

            <div className="mt-12">
              <OrderForm defaultOffre={offre ?? ""} />
            </div>

            <p className="mt-10 text-sm text-muted">
              Vous preferez écrire directement ?{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="underline underline-offset-4"
              >
                {SITE.email}
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
