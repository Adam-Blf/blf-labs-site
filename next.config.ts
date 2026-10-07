import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { NextConfig } from "next";

// EN: local dev only. Load the central secrets file when it exists. Variables
// already set win, and on Vercel the file is absent so this is a no-op.
// FR : developpement local seulement. Charge le fichier de secrets central s'il
// existe. Les variables deja definies l'emportent, et sur Vercel le fichier est
// absent, donc rien ne se passe.
const centralEnvFile =
  process.env.CENTRAL_ENV_FILE ?? join(homedir(), ".secrets", "projets.env");
if (existsSync(centralEnvFile)) process.loadEnvFile(centralEnvFile);

/**
 * En-tetes de securite appliques a toutes les reponses.
 *
 * On ne pose PAS de `Content-Security-Policy` avec `script-src` stricte : le
 * script d'amorcage du theme (anti-FOUC) et les scripts inline de Next
 * casseraient sans nonce. On se limite ici a ce qui durcit sans rien casser
 * (anti-clickjacking, anti-sniff, HSTS, referrer, permissions). Une CSP complete
 * a nonce est une etape a part.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Pastille de developpement masquee : elle se superpose au coin bas gauche et
  // pollue les captures d'ecran servant a valider la direction artistique.
  devIndicators: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    /*
     * LES ANCIENNES ADRESSES DU BACK-OFFICE.
     *
     * Le regroupement en poles a fait disparaitre quatre adresses. Les laisser
     * tomber en 404 serait une faute : elles sont dans les favoris, et rien ne
     * previendrait qu'elles ont bouge. Une redirection coute une ligne.
     *
     * `permanent: false` volontairement : ces chemins peuvent encore bouger, et
     * une 308 se met en cache dans le navigateur pour toujours - y compris
     * quand elle devient fausse.
     *
     * `/admin/facturation/[id]` n'est PAS capture : une source exacte ne
     * s'applique pas aux sous-chemins, et la fiche d'une facture reste ou elle
     * est.
     */
    return [
      ["/admin/leads", "/admin/activite?onglet=leads"],
      ["/admin/projets", "/admin/activite?onglet=projets"],
      ["/admin/facturation", "/admin/argent?onglet=facturation"],
      ["/admin/comptabilite", "/admin/argent?onglet=comptabilite"],
    ].map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    }));
  },
};

export default nextConfig;
