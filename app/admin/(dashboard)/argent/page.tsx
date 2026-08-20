import { PageHeading } from "@/components/admin/PageHeading";
import { Onglets } from "@/components/admin/Onglets";
import { POLES, ongletCourant } from "@/components/admin/navigation";
import { SectionFacturation } from "@/components/admin/sections/Facturation";
import { SectionComptabilite } from "@/components/admin/sections/Comptabilite";

export const dynamic = "force-dynamic";

const POLE = POLES.find((p) => p.chemin === "/admin/argent")!;

/**
 * L'argent : ce qu'on facture, ce qu'on encaisse, ce qui se declare.
 *
 * Devis et comptabilite etaient deux ecrans distincts alors qu'ils lisent la
 * MEME table de factures - l'un pour suivre les paiements, l'autre pour en
 * tirer le recapitulatif URSSAF. Passer de l'un a l'autre demandait de
 * traverser la barre de navigation.
 *
 * Le parametre `p` de la comptabilite (trimestre ou mois) est transmis tel
 * quel : il vivait deja dans l'URL, il continue.
 */
export default async function ArgentPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string; p?: string }>;
}) {
  const params = await searchParams;
  const actif = ongletCourant(POLE, params.onglet);
  const aide = POLE.onglets.find((o) => o.cle === actif)?.aide ?? POLE.aide;

  return (
    <section className="space-y-8">
      <div>
        <PageHeading title="Argent" sub={aide} />
        <Onglets pole={POLE} actif={actif} />
      </div>

      {actif === "facturation" ? (
        <SectionFacturation />
      ) : (
        <SectionComptabilite searchParams={Promise.resolve({ p: params.p })} />
      )}
    </section>
  );
}
