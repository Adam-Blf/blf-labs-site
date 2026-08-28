import { supabaseServer } from "@/lib/supabase/server";
import { Vide } from "@/components/admin/Vide";
import { FilOuvert } from "@/components/admin/FilOuvert";

/**
 * LES REPONSES, LUES ET TRAITEES ICI PLUTOT QUE DANS GMAIL.
 *
 * Avant cet ecran, une reponse arrivait dans la boite personnelle d'Adam par la
 * redirection de `adam@beloucif.com`, et elle n'avait AUCUN chemin vers la
 * base. Trois consequences, toutes mesurables :
 *
 *   - une reponse « retirez-moi » restait une note mentale. Le back-office
 *     n'avait aucun moyen d'inscrire une opposition, et `desinscrire()` n'est
 *     appelable que par un jeton signe, donc par la personne elle-meme ;
 *   - la sequence continuait. Quelqu'un qui ecrivait « rappelez-moi en
 *     octobre » recevait quand meme le message de cloture cinq jours plus tard,
 *     qui commence par « sans reponse de votre part » ;
 *   - on ne savait pas compter une reponse, donc on ne savait pas dire si le
 *     canal fonctionne. C'est le seul chiffre qui compte.
 *
 * LE HTML DU MESSAGE N'EST JAMAIS AFFICHE, et c'est le point de securite de cet
 * ecran. Un message entrant est du contenu HOSTILE par construction : il vient
 * d'un inconnu, et il s'affiche dans une interface authentifiee en deuxieme
 * facteur. On rend le TEXTE BRUT. La colonne `html` est conservee pour qu'un
 * jour on puisse l'assainir et l'afficher, pas pour l'injecter aujourd'hui.
 */

type Fil = {
  id: string;
  email: string;
  sujet: string;
  dernier_message_at: string;
  non_lu: boolean;
  contact_id: string | null;
  messages: {
    id: string;
    direction: "entrant" | "sortant";
    texte: string;
    created_at: string;
  }[];
};

export async function SectionMessages() {
  const supabase = await supabaseServer();
  const { data, error } = supabase
    ? await supabase
        .from("fils")
        .select(
          "id, email, sujet, dernier_message_at, non_lu, contact_id, messages(id, direction, texte, created_at)",
        )
        .eq("archive", false)
        .order("dernier_message_at", { ascending: false })
        .limit(100)
    : { data: null, error: null };

  /*
   * UNE LECTURE REFUSEE N'EST PAS UNE LISTE VIDE. Sans ce test, une politique
   * RLS mal posee afficherait « aucun message », ce qui se lit comme une bonne
   * nouvelle alors que c'est une panne.
   */
  if (error) {
    return (
      <p className="blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
        Lecture impossible : {error.message}
      </p>
    );
  }

  const fils = (data ?? []) as unknown as Fil[];

  if (fils.length === 0) {
    return (
      <Vide
        titre="Aucune réponse pour l'instant"
        aide="Les réponses aux messages de prospection arrivent ici dès qu'un enregistrement MX pointe reponses.beloucif.com vers Resend. Tant qu'il manque, elles continuent d'arriver dans la boîte personnelle et rien ne s'affiche ici."
      />
    );
  }

  return (
    <div className="space-y-4">
      {fils.map((fil) => (
        <FilOuvert
          key={fil.id}
          id={fil.id}
          email={fil.email}
          sujet={fil.sujet}
          nonLu={fil.non_lu}
          messages={[...fil.messages].sort(
            (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
          )}
        />
      ))}
    </div>
  );
}
