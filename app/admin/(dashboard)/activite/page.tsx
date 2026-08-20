import { PageHeading } from "@/components/admin/PageHeading";
import { Onglets } from "@/components/admin/Onglets";
import { POLES, ongletCourant } from "@/components/admin/navigation";
import { SectionLeads } from "@/components/admin/sections/Leads";
import { SectionProjets } from "@/components/admin/sections/Projets";

export const dynamic = "force-dynamic";

const POLE = POLES.find((p) => p.chemin === "/admin/activite")!;

/**
 * L'activite commerciale : les demandes qui arrivent, les projets qui avancent.
 *
 * Les deux vivaient a deux adresses, alors qu'ils sont deux moments du meme
 * fil - une demande gagnee devient un projet, et on passe de l'un a l'autre
 * dans la meme minute. Les anciennes adresses redirigent ici.
 *
 * CHAQUE ONGLET LIT SES PROPRES DONNEES, et seulement quand il est ouvert :
 * charger les deux tableaux a chaque visite ferait deux lectures pour un seul
 * regarde.
 */
export default async function ActivitePage({
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
        <PageHeading title="Activité" sub={aide} />
        <Onglets pole={POLE} actif={actif} />
      </div>

      {actif === "leads" ? <SectionLeads /> : <SectionProjets />}
    </section>
  );
}
