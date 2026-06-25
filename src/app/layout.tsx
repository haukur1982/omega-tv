import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import PageViewTracker from "@/components/PageViewTracker";
import JsonLd from "@/components/JsonLd";
import { SITE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

// UI sans — Inter for labels, kickers, meta, UI elements
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

// Editorial body — Newsreader (Production Type), designed specifically
// for digital long-form reading. Replaces Libre Baskerville. More
// distinctive forms; less ubiquitous than Baskerville.
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Display serif — Fraunces (Undercase Type) for Vaka/Kveða hero
// moments. Variable optical sizing means letterforms automatically
// adapt as size scales (more dramatic at hero, more readable at body).
// Replaces Source Serif 4. More personality, less ubiquitous.
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Omega — Kristin sjónvarpsstöð á Íslandi",
    template: "%s | Omega",
  },
  description:
    "Omega er kristin sjónvarpsstöð á Íslandi frá 1992. Bein útsending, prédikanir, þáttasafn, bænir og fagnaðarerindið um Jesú Krist. Iceland's Christian television station since 1992.",
  metadataBase: new URL(SITE.url),
  applicationName: "Omega",
  keywords: [...SITE.keywords],
  authors: [{ name: "Omega Stöðin", url: SITE.url }],
  publisher: "Omega Stöðin",
  category: "religion",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "is_IS",
    alternateLocale: "en_US",
    url: SITE.url,
    siteName: "Omega",
    title: "Omega — Kristin sjónvarpsstöð á Íslandi",
    description:
      "Kristin sjónvarpsstöð á Íslandi frá 1992. Bein útsending, prédikanir, bænir og fagnaðarerindið. Iceland's Christian TV.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Omega — kristin sjónvarpsstöð á Íslandi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omega — Kristin sjónvarpsstöð á Íslandi",
    description: "Kristin sjónvarpsstöð á Íslandi frá 1992. Iceland's Christian TV.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B1814",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is">
      <body className={`min-h-screen flex flex-col antialiased selection:bg-[var(--kerti)] selection:text-black ${inter.variable} ${newsreader.variable} ${fraunces.variable} font-sans`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <main className="flex-grow">
          {children}
        </main>
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}
