"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeading } from "@/components/admin/PageHeading";

/**
 * FILET DU BACK-OFFICE.
 *
 * Ce fichier n'existait pas, et son absence rendait muettes les 28 exceptions
 * des actions serveur : on cliquait, il ne se passait rien, aucune trace a
 * l'ecran. Le cas le plus couteux etait l'emission d'une piece comptable, dont
 * les refus sont desormais rendus comme un etat et affiches a cote du bouton.
 *
 * Ce filet ne remplace pas ce traitement-la, il attrape ce qui reste : les
 * pannes que personne n'a prevues. Une erreur inattendue doit se voir, sinon
 * elle se confond avec un clic sans effet et se diagnostique a l'aveugle.
 *
 * Le message est affiche parce que cet ecran est deja derriere le mot de passe
 * et la double authentification : le seul lecteur possible est l'exploitant du
 * site. La pile d'appel, elle, reste cote serveur.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Cette page n'a pas pu s'afficher"
        sub="L'action a echoue. Le detail ci-dessous sert a la diagnostiquer ; rien n'a ete enregistre a moitie du cote des pieces comptables, dont l'emission est atomique."
      />
      <Card className="flex flex-col gap-4 p-4">
        <p className="text-sm text-ink">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-muted">
            Reference a citer dans les journaux serveur :{" "}
            <span className="mono">{error.digest}</span>
          </p>
        )}
        <div>
          <Button onClick={reset}>Reessayer</Button>
        </div>
      </Card>
    </div>
  );
}
