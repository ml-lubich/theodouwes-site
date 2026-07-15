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
  title: "Theo Douwes — AI Transformation & Quant Research",
  description:
    "Quantifying developer productivity into business outcomes. AI Transformation at Navigara. UC Berkeley Statistics. Engineering Throughput Value (ETV).",
  openGraph: {
    title: "Theo Douwes",
    description:
      "Quantifying developer productivity into business outcomes in the AI era.",
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
