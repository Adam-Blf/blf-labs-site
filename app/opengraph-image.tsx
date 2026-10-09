import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Carte de partage du site, generee au build.
 *
 * Sans elle, chaque lien partage vers beloucif.com s'affichait en texte nu sur
 * LinkedIn, WhatsApp ou Slack, a cote de liens concurrents qui portent tous une
 * image. C'est le manque le plus visible du site a l'exterieur, et le seul que
 * personne ne voit en naviguant dessus.
 *
 * Elle est generee et non dessinee a la main : le jour ou le nom, la couleur ou
 * la promesse changent, l'image suit sans qu'on ait a rouvrir un editeur
 * d'images et a se souvenir qu'elle existe.
 *
 * La police est lue depuis le depot, pas telechargee : la regle d'assets locaux
 * vaut aussi au build, et une generation qui depend d'un CDN casse le jour ou ce
 * CDN tombe ou change d'URL.
 */
export const alt =
  "BLF Lab's, studio de développement d'applications en Île-de-France";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Satori, le moteur derriere ImageResponse, ne lit ni woff2 ni les polices
 * variables : il lui faut un fichier statique. D'ou ce fichier dedie, present
 * uniquement pour la generation et jamais servi au navigateur.
 */
async function police() {
  return readFile(join(process.cwd(), "assets", "archivo-800.ttf"));
}

export default async function Image() {
  const archivo = await police();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // Jetons du theme sombre du site. Ecrits en dur ici et nulle part
          // ailleurs : cette image est generee hors du navigateur, elle n'a
          // aucun acces aux variables CSS.
          backgroundColor: "#111016",
          color: "#edeef1",
          padding: "72px 80px",
          fontFamily: "Archivo",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9a94a6",
          }}
        >
          Studio de développement - Île-de-France
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 82,
            lineHeight: 1.02,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>On construit</div>
          <div style={{ display: "flex" }}>votre logiciel.</div>
          {/* Le violet ne sert qu'aux points d'accent, ici comme sur le site. */}
          <div style={{ display: "flex", color: "#cb6ce6" }}>
            Vous en gardez les clés.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#9a94a6",
          }}
        >
          <div style={{ display: "flex", color: "#edeef1" }}>BLF Lab&apos;s</div>
          <div style={{ display: "flex" }}>beloucif.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Archivo", data: archivo, weight: 800, style: "normal" }],
    },
  );
}
