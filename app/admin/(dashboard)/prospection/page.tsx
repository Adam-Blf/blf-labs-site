import { PageHeading } from "@/components/admin/PageHeading";
import { Onglets } from "@/components/admin/Onglets";
import { POLES, ongletCourant } from "@/components/admin/navigation";
import { SectionContacts } from "@/components/admin/sections/Contacts";
import { SectionEnvois } from "@/components/admin/sections/Envois";
import { SectionRetraits } from "@/components/admin/sections/Retraits";

export const dynamic = "force-dynamic";

const POLE = POLES.find((p) => p.chemin === "/admin/prospection")!;

/**
 * Le pole prospection : qui a accepte, ce qui est parti, qui s'est retire.
 *
 * Les trois onglets sont les trois questions qu'on se pose dans cet ordre. Le
 * troisieme, les retraits, n'est pas une annexe : c'est celui qui explique un
 * silence, et c'est aussi la piece qu'un controle demande.
 *
 * Chaque onglet lit ses propres donnees et seulement quand il est ouvert.
 */
export default async function ProspectionPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { onglet } = await searchParams;
  const actif = ongletCourant(POLE, onglet);
  const aide = POLE.onglets.find((o) => o.cle === actif)?.aide ?? POLE.aide;

  return (
    <section className="space-y-8">
      <div>
        <PageHeading title="Prospection" sub={aide} />
        <Onglets pole={POLE} actif={actif} />
      </div>

      {actif === "contacts" && <SectionContacts />}
      {actif === "envois" && <SectionEnvois />}
      {actif === "retraits" && <SectionRetraits />}
    </section>
  );
}
