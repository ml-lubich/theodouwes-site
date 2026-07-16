import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { flattenSkills } from "@/lib/skills";
import { profile } from "@/lib/profile";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const SITE_URL = "https://theodouwes.com";

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

const description =
  "UC Berkeley Statistics graduate (B.A.) building GTM automation, multifamily underwriting tools, and probabilistic decision software. GTM and Sales Engineer at Navigara in San Francisco.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Theo Douwes — GTM Systems, Underwriting & Probabilistic Decisions",
    template: "%s · Theo Douwes",
  },
  description,
  keywords: [
    "Theo Douwes",
    "Theo Alexander Douwes",
    "UC Berkeley Statistics",
    "GTM Sales Engineer",
    "Quantitative Analyst",
    "Data Analyst",
    "Data Scientist",
    "Software Engineer",
    "Bayesian inference",
    "multifamily underwriting",
    "Navigara",
    "San Francisco",
    "R Shiny",
    "Streamlit",
    "prediction markets",
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
    siteName: "Theo Douwes",
    title: "Theo Douwes — GTM Systems, Underwriting & Probabilistic Decisions",
    description,
    images: [
      {
        url: "/theo.webp",
        width: 800,
        height: 800,
        alt: "Portrait of Theo Alexander Douwes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Theo Douwes — GTM Systems & Probabilistic Decisions",
    description,
    images: ["/theo.webp"],
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
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: SITE_URL,
  image: `${SITE_URL}/theo.webp`,
  email: profile.links.email,
  telephone: profile.links.phone,
  jobTitle: "GTM and Sales Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Navigara",
    url: profile.links.navigara,
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of California, Berkeley",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    addressCountry: "US",
  },
  sameAs: [
    profile.links.linkedin,
    profile.links.github,
    profile.links.medium,
  ],
  knowsAbout: flattenSkills().slice(0, 40),
  description,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
