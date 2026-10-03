import { profile } from "@/lib/profile";
import { flattenSkills } from "@/lib/skills";

export const SITE_URL = "https://theodouwes.com";
export const SITE_NAME = "Theo Douwes";
export const SITE_TITLE = "Theo Douwes — GTM & Sales Engineer, Quant & Statistics";
export const SITE_DESCRIPTION =
  "UC Berkeley Statistics grad and GTM and Sales Engineer at Navigara in San Francisco. Builds multifamily underwriting tools and Bayesian decision software.";

export function googleVerification(
  env: Record<string, string | undefined> = process.env,
): { google: string } | undefined {
  const v = env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  return v ? { google: v } : undefined;
}

export function buildJsonLd(): {
  "@context": "https://schema.org";
  "@graph": object[];
} {
  const person = { "@id": `${SITE_URL}/#person` };
  const website = { "@id": `${SITE_URL}/#website` };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        ...person,
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
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        ...website,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-US",
        publisher: person,
        author: person,
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: SITE_TITLE,
        isPartOf: website,
        mainEntity: person,
        about: person,
      },
    ],
  };
}
