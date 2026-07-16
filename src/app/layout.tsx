import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theodouwes-site.vercel.app"),
  title: "Theo Douwes — GTM Systems, Underwriting & Probabilistic Decisions",
  description:
    "UC Berkeley Statistics graduate building GTM automation, multifamily underwriting tools, and probabilistic decision software. Navigara GTM and Sales Engineer.",
  openGraph: {
    title: "Theo Douwes",
    description:
      "Statistics graduate building GTM systems, underwriting tools, and probabilistic decision software.",
    type: "website",
    images: [{ url: "/theo.webp" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
