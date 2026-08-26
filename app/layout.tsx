import type { Metadata } from "next";
import { Analytics } from "@/components/analytics/Analytics";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { StickyCta } from "@/components/layout/StickyCta";
import { sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://beloucif.com"),
  title: {
    // Ce texte est ce que Google affiche en titre de resultat : les accents
    // manquants y etaient visibles publiquement.
    default: "BLF Lab's - studio de développement d'applications",
    template: "%s - BLF Lab's",
  },
  description:
    "Studio indépendant qui conçoit et livre des sites, des applications web et mobiles, et des outils data et IA. Basé en Île-de-France.",
  keywords: [
    "développement web",
    "création site internet",
    "application web",
    "application mobile",
    "studio développement Île-de-France",
    "développeur freelance Val-de-Marne",
  ],
  authors: [{ name: "Adam Beloucif" }],
  creator: "Adam Beloucif",
  publisher: "BLF Lab's",
  // Adresse canonique : sans elle, une page atteinte avec un parametre de
  // suivi (utm_source et consorts) peut etre indexee comme un doublon.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "BLF Lab's",
    url: "https://beloucif.com",
    title: "BLF Lab's - studio de développement d'applications",
    description:
      "Studio indépendant qui conçoit et livre des sites, des applications web et mobiles, et des outils data et IA.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Sans ces trois valeurs, Google tronque par defaut l'apercu et la
      // vignette dans ses resultats.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

/**
 * Applique le theme avant le premier rendu, pour eviter le flash de theme clair
 * chez un visiteur qui a choisi le sombre. Reste inline volontairement : un
 * fichier separe serait charge trop tard.
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
      className={`${sans.variable} dir-labs h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {/*
          Lien d'evitement, premier element focalisable du document. C'est le
          geste numero un de qui navigue au clavier ou au lecteur d'ecran, et
          son absence obligeait a traverser les huit arrets de l'en-tete a
          chaque page. Critere WCAG 2.4.1.

          Il vise `#contenu`, pose sur le <main> de chaque page plutot que sur
          un conteneur du gabarit : ici Header, main et Footer sont freres dans
          le flux flex du <body>, et les envelopper aurait casse la mise en
          page de tout le site pour un ancrage.
        */}
        <a
          href="#contenu"
          className="sr-only rounded-none focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Aller au contenu
        </a>
        {children}
        {/*
          Les deux ne s'affichent que si NEXT_PUBLIC_GA_ID est configure. Sans
          cette variable, le site ne mesure rien et ne demande donc aucun
          consentement : il tourne a l'identique, sans bandeau.
        */}
        <StickyCta />
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
