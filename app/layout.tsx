import type { Metadata } from "next";
import { sans } from "./fonts";
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
 * Le site est nativement sombre : il n'y a plus qu'un seul jeu de couleurs, donc
 * plus de script anti-flash ni de bascule de theme. C'est aussi un script de
 * moins execute avant le premier rendu.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${sans.variable} dir-labs h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
