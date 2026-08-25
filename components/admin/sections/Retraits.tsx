import { supabaseServer } from "@/lib/supabase-server";
import { Vide } from "@/components/admin/Vide";

/**
 * LA LISTE DE SUPPRESSION, EN LECTURE SEULE.
 *
 * Aucun bouton pour retirer une ligne, et c'est le point de cet ecran. Une
 * adresse qui figure ici a exercé son droit d'opposition, ou a rebondi
 * durablement, ou s'est plainte. La remettre en circulation depuis une
 * interface serait exactement la faute que cette table existe pour empecher, et
 * une reinscription apres desabonnement a deja coute 250 000 euros a un
 * annonceur devant la CNIL.
 *
 * S'il faut vraiment retirer une ligne, parce qu'une personne redemande
 * elle-meme a etre reinscrite, cela se fait en base, a la main, en sachant ce
 * qu'on fait. La friction est voulue.
 */

type Retrait = {
  email: string;
  raison: string;
  ajoute_at: string;
};

const LIBELLE: Record<string, string> = {
  desinscription: "Désinscription",
  plainte: "Plainte pour indésirable",
  bounce_dur: "Adresse inexistante",
  demande_directe: "Demande directe",
};

export async function SectionRetraits() {
  const supabase = await supabaseServer();
  const { data, error } = supabase
    ? await supabase
        .from("suppression_list")
        .select("email, raison, ajoute_at")
        .order("ajoute_at", { ascending: false })
        .limit(200)
    : { data: null, error: null };

  const retraits = (data ?? []) as Retrait[];

  if (error) {
    return (
      <p className="blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
        Lecture impossible : {error.message}
      </p>
    );
  }

  if (retraits.length === 0) {
    return (
      <Vide
        titre="Personne ne s'est retiré"
        aide="Cette liste est volontairement en lecture seule : une adresse qui y entre ne peut plus être réinscrite par un formulaire, et c'est ce qui protège du pire manquement possible."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="rule-b text-left">
          <tr className="mono text-xs text-muted">
            <th className="py-2 pr-4">Adresse</th>
            <th className="py-2 pr-4">Motif</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {retraits.map((retrait) => (
            <tr key={retrait.email} className="rule-b">
              <td className="py-3 pr-4">{retrait.email}</td>
              <td className="py-3 pr-4 text-muted">
                {LIBELLE[retrait.raison] ?? retrait.raison}
              </td>
              <td className="tabular py-3 text-muted">
                {new Date(retrait.ajoute_at).toLocaleString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
