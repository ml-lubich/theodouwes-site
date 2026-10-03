import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  buildJsonLd,
  googleVerification,
} from "@/lib/seo";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark"}})();`;

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Theo Douwes",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Theo Douwes",
    "Theo Alexander Douwes",
    "UC Berkeley Statistics",
    "GTM Sales Engineer",
    "Quantitative Analyst",
    "Data Analyst",
    "Data Scientist",
    "Analytics Engineering",
    "Decision Science",
    "Software Engineer",
    "Bayesian inference",
    "multifamily underwriting",
    "Navigara",
    "San Francisco",
    "R Shiny",
    "Streamlit",
    "prediction markets",
    "model diagnostics",
    "data quality testing",
  ],
  authors: [{ name: "Theo Alexander Douwes", url: SITE_URL }],
  creator: "Theo Alexander Douwes",
  publisher: "Theo Alexander Douwes",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
  category: "technology",
  verification: googleVerification(),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
