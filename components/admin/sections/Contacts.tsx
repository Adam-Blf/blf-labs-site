import { supabaseServer } from "@/lib/supabase-server";
import { Vide } from "@/components/admin/Vide";

/**
 * La liste, et surtout CE QUI AUTORISE A ECRIRE A CHACUN.
 *
 * La colonne qui compte n'est pas l'adresse, c'est le regime. Une fiche en
 * opt-in non confirmee ne recevra jamais rien, et c'est normal ; une fiche en
 * regime professionnel n'a pas de confirmation a attendre. Afficher les deux
 * dans la meme colonne sans dire lequel est lequel reproduirait a l'ecran
 * exactement la confusion que la base interdit.
 */

type Contact = {
  id: string;
  created_at: string;
  email: string;
  nom: string | null;
  organisation: string | null;
  regime: "optin" | "b2b_generique";
  statut: string;
  source: string;
  last_engagement_at: string | null;
};

const LIBELLE_STATUT: Record<string, string> = {
  en_attente: "En attente de confirmation",
  confirme: "Confirmé",
  desinscrit: "Désinscrit",
  bounce: "Adresse morte",
  plainte: "Plainte",
};

const LIBELLE_REGIME: Record<string, string> = {
  optin: "Consentement",
  b2b_generique: "Professionnel, adresse générique",
};

function date(valeur: string | null): string {
  if (!valeur) return "jamais";
  return new Date(valeur).toLocaleDateString("fr-FR");
}

export async function SectionContacts() {
  const supabase = await supabaseServer();
  const { data, error } = supabase
    ? await supabase
        .from("contacts")
        .select(
          "id, created_at, email, nom, organisation, regime, statut, source, last_engagement_at",
        )
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: null, error: null };

  const contacts = (data ?? []) as Contact[];

  if (error) {
    return (
      <p className="blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
        Lecture impossible : {error.message}
      </p>
    );
  }

  if (contacts.length === 0) {
    return (
      <Vide
        titre="Aucun contact pour l'instant"
        aide="La liste se remplit par la case facultative du formulaire de commande et par le formulaire du pied de page. Tant que personne n'a coché, il n'y a rien à envoyer, et c'est le comportement attendu."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="rule-b text-left">
          <tr className="mono text-xs text-muted">
            <th className="py-2 pr-4">Adresse</th>
            <th className="py-2 pr-4">Régime</th>
            <th className="py-2 pr-4">Statut</th>
            <th className="py-2 pr-4">Origine</th>
            <th className="py-2">Dernière interaction</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="rule-b align-top">
              <td className="py-3 pr-4">
                <span className="title block text-sm">{contact.email}</span>
                {(contact.nom || contact.organisation) && (
                  <span className="text-xs text-muted">
                    {[contact.nom, contact.organisation].filter(Boolean).join(", ")}
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 text-muted">
                {LIBELLE_REGIME[contact.regime] ?? contact.regime}
              </td>
              <td className="py-3 pr-4 text-muted">
                {LIBELLE_STATUT[contact.statut] ?? contact.statut}
              </td>
              <td className="py-3 pr-4 text-muted">{contact.source}</td>
              <td className="tabular py-3 text-muted">
                {date(contact.last_engagement_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
