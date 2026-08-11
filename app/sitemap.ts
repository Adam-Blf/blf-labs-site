import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { ETUDES } from "@/content/etudes";
import { OFFRES } from "@/content/offres";

/**
 * Plan du site, servi sur /sitemap.xml.
 *
 * Next.js genere le XML a partir de ce tableau : il n'y a pas de fichier
 * statique a maintenir en parallele, donc une page ajoutee au site ne peut pas
 * etre oubliee ici tant que sa source figure dans `content/`.
 *
 * `priority` n'est qu'une indication d'importance RELATIVE entre les pages du
 * meme site : elle ne pese pas sur le classement face aux autres domaines.
 * `changeFrequency` est traitee comme un indice, pas comme une instruction.
 *
 * Les pages legales sont declarees en priorite basse : elles doivent etre
 * indexees, parce que leur absence est un defaut de conformite verifiable,
 * mais elles n'ont pas vocation a etre des portes d'entree.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: Array<{
    chemin: string;
    priorite: number;
    frequence: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { chemin: "", priorite: 1, frequence: "monthly" },
    { chemin: "/services", priorite: 0.9, frequence: "monthly" },
    { chemin: "/tarifs", priorite: 0.9, frequence: "monthly" },
    { chemin: "/contact", priorite: 0.8, frequence: "yearly" },
    { chemin: "/rendez-vous", priorite: 0.8, frequence: "yearly" },
    { chemin: "/a-propos", priorite: 0.7, frequence: "yearly" },
    { chemin: "/maintenance", priorite: 0.7, frequence: "yearly" },
    { chemin: "/studio-ou-agence", priorite: 0.7, frequence: "yearly" },
    {
      chemin: "/developpement-web-ile-de-france",
      priorite: 0.8,
      frequence: "monthly",
    },
    { chemin: "/commander", priorite: 0.9, frequence: "yearly" },
    { chemin: "/methode", priorite: 0.7, frequence: "yearly" },
    { chemin: "/references", priorite: 0.7, frequence: "monthly" },
    // Une etude de cas par realisation : c'est le contenu le plus long du
    // site, donc celui qui a le plus de chances de se classer.
    ...ETUDES.map((etude) => ({
      chemin: `/references/${etude.slug}`,
      priorite: 0.8,
      frequence: "yearly" as const,
    })),
    { chemin: "/questions", priorite: 0.6, frequence: "monthly" },
    { chemin: "/legal/mentions", priorite: 0.2, frequence: "yearly" },
    { chemin: "/legal/confidentialite", priorite: 0.2, frequence: "yearly" },
    { chemin: "/legal/cgv", priorite: 0.2, frequence: "yearly" },
    { chemin: "/legal/cookies", priorite: 0.2, frequence: "yearly" },
  ];

  // Une page par offre, listee depuis le contenu pour qu'une nouvelle offre
  // entre dans le plan du site sans intervention.
  for (const offre of OFFRES) {
    pages.push({
      chemin: `/offre/${offre.slug}`,
      priorite: 0.8,
      frequence: "monthly",
    });
  }

  return pages.map(({ chemin, priorite, frequence }) => ({
    url: `${SITE.url}${chemin}`,
    lastModified: now,
    changeFrequency: frequence,
    priority: priorite,
  }));
}
