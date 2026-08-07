import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pastille de developpement masquee : elle se superpose au coin bas gauche et
  // pollue les captures d'ecran servant a valider la direction artistique.
  devIndicators: false,
};

export default nextConfig;
