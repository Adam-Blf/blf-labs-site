"use server";

import { redirect } from "next/navigation";
import { serviceClient } from "@/lib/supabase";
import { litJeton } from "@/lib/prospection/jeton";

/**
 * Le retrait declenche depuis la page.
 *
 * Fichier separe de la page : dans un module `"use server"`, tout export est
 * une adresse appelable depuis le navigateur. Melanger une action et le rendu
 * d'une page expose les exports du rendu, et sur Next un export invalide dans
 * un module serveur casse le module entier au build, pas seulement au
 * typecheck.
 *
 * La redirection porte `fait=1` plutot qu'un etat en memoire : rafraichir la
 * page apres coup doit montrer la confirmation, pas reproposer le bouton.
 */
export async function retireDeLaListe(donnees: FormData): Promise<void> {
  const jeton = String(donnees.get("jeton") ?? "");
  const email = litJeton("desinscription", jeton);

  if (email) {
    const db = serviceClient();
    if (db) {
      await db.rpc("desinscrire", { cible: email, motif: "desinscription" });
    }
  }

  // Meme destination que le jeton soit valide ou non : cette page est publique,
  // et une reponse differente en ferait un moyen de tester des adresses.
  redirect("/desinscription?fait=1");
}
