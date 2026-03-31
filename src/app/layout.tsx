import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Omega | Kristin sjónvarpsstöð síðan 1992",
    template: "%s | Omega",
  },
  description: "Kristin sjónvarpsstöð á Íslandi síðan 1992. Horfa beint, bænir, fréttabréf og fræðsluefni á íslensku.",
  metadataBase: new URL("https://omega.is"),
  openGraph: {
    type: "website",
    locale: "is_IS",
    siteName: "Omega",
    title: "Omega | Kristin sjónvarpsstöð síðan 1992",
    description: "Horfa beint, bænir, fréttabréf og fræðsluefni á íslensku.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omega | Kristin sjónvarpsstöð síðan 1992",
    description: "Horfa beint, bænir, fréttabréf og fræðsluefni á íslensku.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0B0F19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is">
      <body className={`min-h-screen flex flex-col antialiased selection:bg-[var(--primary-glow)] selection:text-black ${inter.variable} ${libre.variable} font-sans`}>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
