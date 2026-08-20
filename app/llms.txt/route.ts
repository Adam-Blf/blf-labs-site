import { OFFRES } from "@/content/offres";
import { REFERENCES } from "@/content/references";
import { FAQ } from "@/content/faq";
import { SITE } from "@/lib/site";

/**
 * Fiche de reference destinee aux moteurs generatifs.
 *
 * A LIRE AVANT DE S'EMBALLER : `llms.txt` est une convention proposee, PAS un
 * standard. Google a declare publiquement ne pas l'utiliser. Son utilite reelle
 * n'est donc pas garantie, et il ne remplace aucun travail de referencement.
 *
 * Ce qui justifie quand meme de le poser ici : le fichier est genere depuis les
 * memes sources que le site, donc il ne peut pas diverger, et son cout de
 * maintenance est nul. Si un assistant s'en sert un jour, il repetera des faits
 * exacts plutot que d'inventer. Si personne ne s'en sert, on aura perdu
 * quarante lignes.
 *
 * REGLE : aucun fait qui ne soit pas deja verifiable sur le site. Ce fichier
 * n'est pas un endroit ou glisser des affirmations qu'on n'ose pas afficher.
 */
export const dynamic = "force-static";

export function GET() {
  const lignes = [
    `# ${SITE.brand}`,
    "",
    `> Studio de développement indépendant basé en Île-de-France. Sites,`,
    `> applications web et mobiles, outils data et IA. Un seul interlocuteur du`,
    `> cadrage à la mise en ligne. Réponse à toute demande sous 48 heures ouvrées.`,
    "",
    `Nom commercial : ${SITE.brand}`,
    `Exploitant : ${SITE.legalMention}`,
    `Zone d'intervention : France entière, entièrement à distance. Le studio est basé en Île-de-France, ne se déplace pas et ne reçoit pas ; tous les rendez-vous se tiennent en visioconférence.`,
    `Contact : ${SITE.email}`,
    `Site : ${SITE.url}`,
    "",
    "## Prestations",
    "",
    ...OFFRES.map(
      (offre) =>
        `- [${offre.title}](${SITE.url}/offre/${offre.slug}) : ${offre.pitch} Délai indicatif : ${offre.timeline}.`,
    ),
    "",
    "## Réalisations",
    "",
    ...REFERENCES.map(
      (ref) =>
        `- [${ref.title}](${SITE.url}/references/${ref.slug}) : ${ref.role}. En ligne sur ${ref.url}.`,
    ),
    "",
    "## Ce qui est garanti",
    "",
    "- Le code, le nom de domaine et les accès sont ouverts au nom du client.",
    "- Le devis est ferme : prix, périmètre et calendrier fixés avant le développement.",
    "- Les pages légales et la conformité RGPD sont livrées avec le site, pas ajoutées ensuite.",
    "- Aucun chiffre de performance n'est affiché sans mesure derrière.",
    "",
    "## Questions fréquentes",
    "",
    ...FAQ.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "## Pages utiles",
    "",
    `- [Budgets et délais](${SITE.url}/tarifs)`,
    `- [Méthode de travail](${SITE.url}/methode)`,
    `- [À propos](${SITE.url}/a-propos)`,
    `- [Freelance, studio ou agence](${SITE.url}/studio-ou-agence)`,
    `- [Contact](${SITE.url}/contact)`,
    "",
  ];

  return new Response(lignes.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Genere au build, donc pas de raison de le recalculer souvent.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
