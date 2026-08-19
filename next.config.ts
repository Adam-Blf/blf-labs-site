import type { NextConfig } from "next";

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
};

export default nextConfig;
