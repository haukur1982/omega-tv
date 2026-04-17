import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
});

// Display serif — Vaka / Kveða roles (hero moments, section openers)
// Variable font covering weights 200–900, optical-size 8–60.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
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
      <body className={`min-h-screen flex flex-col antialiased selection:bg-[var(--kerti)] selection:text-black ${inter.variable} ${libre.variable} ${sourceSerif.variable} font-sans`}>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
