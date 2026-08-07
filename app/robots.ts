import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Directives d'exploration, servies sur /robots.txt.
 *
 * Le site est integralement destine a etre indexe : c'est une vitrine, il n'y
 * a rien a cacher aux moteurs. Deux exceptions seulement :
 *
 *   /api/  routes de traitement, sans contenu lisible. Les indexer produirait
 *          des resultats vides et exposerait la surface de l'API dans les
 *          moteurs, ce qui invite au sondage automatise.
 *   /admin le futur back-office. La regle est posee AVANT que la page existe :
 *          une page privee decouverte par un robot le jour de sa mise en ligne
 *          est deja indexee quand on y pense.
 *
 * A savoir : robots.txt demande de ne pas EXPLORER, il n'empeche pas
 * d'INDEXER une adresse decouverte ailleurs, et il n'est pas un dispositif de
 * securite - le fichier est public et lisible par tous. La protection reelle
 * de /admin repose sur son authentification, pas sur cette ligne.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
