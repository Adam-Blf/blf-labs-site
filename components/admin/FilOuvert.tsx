"use client";

import * as React from "react";
import {
  archiveFil,
  marqueLu,
  repond,
  retireLAdresse,
} from "@/app/admin/actions-messages";

/**
 * Un fil, ses messages, et les trois gestes qu'on fait dessus.
 *
 * LE TEXTE BRUT, JAMAIS LE HTML. Un message entrant vient d'un inconnu et
 * s'affiche dans une interface authentifiee en deuxieme facteur. Le rendre en
 * HTML, meme « assaini », c'est ouvrir une surface d'attaque pour gagner une
 * mise en forme dont personne n'a besoin pour lire trois phrases. Le `html` est
 * stocke en base pour plus tard, il n'est pas lu ici.
 *
 * `whitespace-pre-wrap` suffit a rendre les retours a la ligne, et React
 * echappe le contenu tout seul des lors qu'on ne passe pas par
 * `dangerouslySetInnerHTML`.
 */

type Message = {
  id: string;
  direction: "entrant" | "sortant";
  texte: string;
  created_at: string;
};

export function FilOuvert({
  id,
  email,
  sujet,
  nonLu,
  messages,
}: {
  id: string;
  email: string;
  sujet: string;
  nonLu: boolean;
  messages: Message[];
}) {
  const [ouvert, setOuvert] = React.useState(nonLu);
  const [reponse, setReponse] = React.useState("");
  const [enCours, setEnCours] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);

  /* Une action qui echoue doit le DIRE. Un bouton qui ne fait rien se lit
     comme un bouton casse, et on reclique, et on envoie deux fois. */
  async function tente(action: () => Promise<void>) {
    setEnCours(true);
    setErreur(null);
    try {
      await action();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec inattendu.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <article className="blk-flat p-4">
      <button
        type="button"
        className="flex w-full items-baseline justify-between gap-4 text-left"
        onClick={() => {
          const suivant = !ouvert;
          setOuvert(suivant);
          if (suivant && nonLu) void tente(() => marqueLu(id));
        }}
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            {nonLu && (
              <span
                aria-label="Non lu"
                className="inline-block size-2 shrink-0 rounded-full bg-accent"
              />
            )}
            <strong className="truncate text-ink">{email}</strong>
          </span>
          <span className="mt-1 block truncate text-sm text-muted">{sujet}</span>
        </span>
        <span className="mono shrink-0 text-xs text-muted">
          {messages.length} message{messages.length > 1 ? "s" : ""}
        </span>
      </button>

      {ouvert && (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.direction === "entrant"
                  ? "border-l-2 border-accent pl-3"
                  : "border-l-2 border-line pl-3 text-muted"
              }
            >
              <p className="mono text-xs text-muted">
                {m.direction === "entrant" ? "Reçu" : "Envoyé"} le{" "}
                {new Date(m.created_at).toLocaleString("fr-FR")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                {m.texte || "(message sans texte)"}
              </p>
            </div>
          ))}

          <label className="block">
            <span className="mono text-xs text-muted">Répondre</span>
            <textarea
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
              rows={4}
              className="mt-1 w-full border border-line bg-surface p-2 text-sm"
              placeholder="Votre réponse, en texte brut."
            />
          </label>

          {erreur && (
            <p className="blk-sm bg-accent px-3 py-2 text-sm text-accent-ink">
              {erreur}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enCours || !reponse.trim()}
              onClick={() =>
                void tente(async () => {
                  await repond(id, reponse);
                  setReponse("");
                })
              }
              className="btn-pill bg-accent px-4 py-2 text-sm font-bold text-accent-ink disabled:opacity-50"
            >
              {enCours ? "…" : "Envoyer"}
            </button>
            <button
              type="button"
              disabled={enCours}
              onClick={() => void tente(() => archiveFil(id))}
              className="btn-pill border border-line px-4 py-2 text-sm"
            >
              Archiver
            </button>
            {/*
              LE GESTE QUI MANQUAIT ENTIEREMENT. Une reponse « retirez-moi »
              n'avait aucun chemin vers la base : la desinscription exige un
              jeton signe, donc le clic de la personne. Celui qui le demande par
              ecrit devait etre retire a la main, en SQL, c'est-a-dire jamais.
            */}
            <button
              type="button"
              disabled={enCours}
              onClick={() => void tente(() => retireLAdresse(id, email))}
              className="btn-pill border border-line px-4 py-2 text-sm text-muted"
              title="Inscrit l'adresse sur la liste de suppression, définitivement"
            >
              Cette personne demande à être retirée
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
