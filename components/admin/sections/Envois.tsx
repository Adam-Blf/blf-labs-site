import { supabaseServer } from "@/lib/supabase-server";
import { Vide } from "@/components/admin/Vide";

/**
 * LE JOURNAL DES ENVOIS.
 *
 * Il existe pour repondre a une seule question, celle qu'on se pose vraiment un
 * lundi matin : pourquoi ce message n'est-il pas parti. Un tableau qui
 * n'afficherait que les succes laisserait croire que le silence vient d'un
 * plafond atteint, alors qu'il vient souvent d'un echec de transport ou d'une
 * cle absente. Les echecs sont donc affiches au meme titre que le reste, avec
 * leur motif.
 */

type Envoi = {
  id: string;
  created_at: string;
  sequence_slug: string;
  etape: number;
  sujet: string;
  statut: string;
  erreur: string | null;
  contact_id: string;
  contacts: { email: string } | null;
};

const LIBELLE: Record<string, string> = {
  file: "En file",
  envoye: "Envoyé",
  delivre: "Délivré",
  ouvert: "Ouvert",
  clic: "Cliqué",
  bounce: "Rebond",
  plainte: "Plainte",
  echec: "Échec",
};

export async function SectionEnvois() {
  const supabase = await supabaseServer();
  const { data, error } = supabase
    ? await supabase
        .from("email_sends")
        .select(
          "id, created_at, sequence_slug, etape, sujet, statut, erreur, contact_id, contacts(email)",
        )
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: null, error: null };

  const envois = (data ?? []) as unknown as Envoi[];

  if (error) {
    return (
      <p className="blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
        Lecture impossible : {error.message}
      </p>
    );
  }

  if (envois.length === 0) {
    return (
      <Vide
        titre="Aucun envoi pour l'instant"
        aide="Le moteur tourne toutes les quinze minutes et ne traite que les échéances dues. Sans contact inscrit, il n'a rien à faire."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="rule-b text-left">
          <tr className="mono text-xs text-muted">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Destinataire</th>
            <th className="py-2 pr-4">Message</th>
            <th className="py-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {envois.map((envoi) => (
            <tr key={envoi.id} className="rule-b align-top">
              <td className="tabular py-3 pr-4 text-muted">
                {new Date(envoi.created_at).toLocaleString("fr-FR")}
              </td>
              <td className="py-3 pr-4">{envoi.contacts?.email ?? "fiche supprimée"}</td>
              <td className="py-3 pr-4">
                <span className="block">{envoi.sujet}</span>
                <span className="mono text-xs text-muted">
                  {envoi.sequence_slug}, étape {envoi.etape + 1}
                </span>
              </td>
              <td className="py-3">
                <span>{LIBELLE[envoi.statut] ?? envoi.statut}</span>
                {envoi.erreur && (
                  <span className="block text-xs text-muted">{envoi.erreur}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
