import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, Fraunces } from "next/font/google";
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
    default: "Omega Stöðin | Allt á einum stað",
    template: "%s | Omega Stöðin",
  },
  description: "Omega Stöðin — kristin fjölmiðlastöð á Íslandi síðan 1992. Bein útsending, þáttasafn, bænir, fræðsluefni og námskeið á íslensku.",
  metadataBase: new URL("https://omega.is"),
  openGraph: {
    type: "website",
    locale: "is_IS",
    siteName: "Omega",
    title: "Omega Stöðin | Allt á einum stað",
    description: "Kristin fjölmiðlastöð á Íslandi síðan 1992.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omega Stöðin | Allt á einum stað",
    description: "Kristin fjölmiðlastöð á Íslandi síðan 1992.",
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
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
