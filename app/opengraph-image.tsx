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
 * d'images et a se souvenir qu'elle existe. Refonte "ligne" du 2026-09-15 : le
 * placard noir, la bande des quatre lignes et le trait sous "clés" reprennent le
 * site.
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
 * Satori, le moteur derriere ImageResponse, ne lit pas le woff2 : il lui faut
 * un fichier TTF statique. D'ou ce fichier dedie, present uniquement pour la
 * generation et jamais servi au navigateur.
 */
async function police() {
  return readFile(join(process.cwd(), "assets", "barlow-condensed-800.ttf"));
}

// Jetons du placard du site (themes.css, mode clair). Ecrits en dur ici et
// nulle part ailleurs : cette image est generee hors du navigateur, elle n'a
// aucun acces aux variables CSS.
const SIGNE = "#0b0e13";
const ENCRE = "#f3f4f6";
const DISCRET = "#aeb5c0";
const LIGNES = ["#f26a4b", "#b27fe0", "#43c07e", "#6c9cf2"];

export default async function Image() {
  const placard = await police();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: SIGNE,
          color: ENCRE,
          padding: "64px 80px",
          fontFamily: "Barlow Condensed",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {LIGNES.map((couleur, index) => (
            <div key={couleur} style={{ display: "flex", alignItems: "center", flex: 1, gap: 6 }}>
              {index > 0 && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    border: `5px solid ${ENCRE}`,
                  }}
                />
              )}
              <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: couleur }} />
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 104,
            lineHeight: 0.95,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>On construit votre logiciel.</div>
          <div style={{ display: "flex" }}>
            Vous en gardez les&nbsp;
            <span
              style={{
                display: "flex",
                borderBottom: "12px solid #ffc21a",
                paddingBottom: 2,
              }}
            >
              clés
            </span>
            .
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 38,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: DISCRET,
          }}
        >
          <div style={{ display: "flex", color: ENCRE }}>BLF Lab&apos;s</div>
          <div style={{ display: "flex" }}>beloucif.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Barlow Condensed", data: placard, weight: 800, style: "normal" }],
    },
  );
}
