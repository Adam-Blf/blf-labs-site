import type { Metadata } from "next";
import { mono, sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://beloucif.com"),
  title: {
    default: "BLF Lab's - studio de developpement d'applications",
    template: "%s - BLF Lab's",
  },
  description:
    "Studio independant qui concoit et livre des sites, des applications web et mobiles, et des outils data et IA. Base en Ile-de-France.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "BLF Lab's",
    url: "https://beloucif.com",
  },
};

/**
 * Applique le theme avant le premier rendu pour eviter le flash de theme clair
 * chez un visiteur en sombre. Reste inline volontairement : un fichier separe
 * serait charge trop tard.
 */
const themeBootstrap = `
try {
  var stored = localStorage.getItem('blf-theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sans.variable} ${mono.variable} dir-labs h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
