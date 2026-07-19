import { flattenSkills } from "./skills";

export interface ExperienceItem {
  readonly id: string;
  readonly role: string;
  readonly org: string;
  readonly location: string;
  readonly start: string;
  readonly end: string;
  readonly highlights: readonly string[];
}

export interface ProjectItem {
  readonly id: string;
  readonly title: string;
  readonly tag: string;
  readonly href: string | null;
  readonly blurb: string;
  readonly methods: readonly string[];
  readonly artifact: string;
}

export interface WritingItem {
  readonly id: string;
  readonly title: string;
  readonly href: string;
  readonly blurb: string;
}

export interface SiteProfile {
  readonly name: string;
  readonly shortName: string;
  readonly monogram: string;
  readonly title: string;
  readonly location: string;
  readonly headline: string;
  readonly subhead: string;
  readonly aboutTitle: string;
  readonly workIntro: string;
  readonly photoSrc: string;
  readonly photoAlt: string;
  readonly portraitMeta: string;
  readonly signals: readonly string[];
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly skills: readonly string[];
  readonly about: readonly string[];
  readonly experience: readonly ExperienceItem[];
  readonly education: {
    readonly school: string;
    readonly degree: string;
    readonly period: string;
    readonly notes: readonly string[];
  };
  readonly projects: readonly ProjectItem[];
  readonly writing: readonly WritingItem[];
  readonly links: {
    readonly linkedin: string;
    readonly github: string;
    readonly medium: string;
    readonly navigara: string;
    readonly zeroCopy: string;
    readonly email: string;
    readonly phone: string;
  };
}

export const profile: SiteProfile = {
  name: "Theo Alexander Douwes",
  shortName: "Theo Douwes",
  monogram: "TD",
  title: "GTM and Sales Engineer @ Navigara | UC Berkeley Statistics",
  location: "San Francisco, California",
  headline:
    "Statistics graduate building GTM systems, underwriting tools, and probabilistic decision software.",
  subhead:
    "Outreach automation for GTM teams, quantitative multifamily underwriting, and risk-aware decision frameworks — published metrics only.",
  aboutTitle: "Probabilistic systems for GTM, underwriting, and risk",
  workIntro:
    "GTM engineering, multifamily underwriting, and independent quant practice — each chapter built on documented outcomes.",
  photoSrc: "/theo.webp",
  photoAlt: "Portrait of Theo Alexander Douwes",
  portraitMeta: "San Francisco · Stats · GTM systems",
  signals: [
    "Navigara",
    "UC Berkeley Stats",
    "GTM automation",
    "Probabilistic modeling",
  ],
  stats: [
    { value: "$5.88M", label: "Multifamily acquisitions structured" },
    { value: "$350K+", label: "Purchase-price savings via CMA + models" },
    { value: "400+", label: "Students taught as STAT 198 Head Instructor" },
    { value: "200K+", label: "TEDx YouTube views as lead organizer" },
  ],
  skills: flattenSkills(),
  about: [
    "Theo Douwes is a UC Berkeley Statistics graduate (B.A., 2019–2023) based in San Francisco. He builds outreach automation for GTM teams, quantitative underwriting tools for multifamily real estate, and probabilistic decision systems spanning Bayesian/MLE inference, prediction-market pricing, and risk-aware decision frameworks.",
    "He taught 400+ students as Head Instructor of Berkeley’s largest DeCal (STAT 198), presented research on algorithmic bias in hiring at Oxford’s Map the System competition, and managed operations for 30 rental units while modeling multifamily acquisitions totaling $5.88M.",
    "Interests include meditation, travel, and practical AI/ML applications. Skills marked as basics or concepts are adjacent and marketable — not claims of years of production ownership.",
  ],
  experience: [
    {
      id: "navigara",
      role: "GTM and Sales Engineer",
      org: "Navigara",
      location: "San Francisco, CA",
      start: "Feb 2026",
      end: "Present",
      highlights: [
        "Designed and implemented shared outreach automation for SDR, marketing, and sales — sequencing, handoffs, and stage visibility.",
        "Documented playbooks, stage definitions, and messaging templates so workflows were repeatable.",
        "Supported Mag 7 lead development using industry connections, research, and outreach tooling (no claimed closed deals).",
        "Advised GTM strategy from competitor-landscape trade-offs; triaged tooling issues cross-functionally.",
      ],
    },
    {
      id: "piedmont",
      role: "Quantitative Real Estate Analyst",
      org: "Piedmont Realty LLC",
      location: "Oakland, CA",
      start: "Jan 2024",
      end: "Sep 2024",
      highlights: [
        "Structured and negotiated 2 multifamily acquisitions totaling $5.88M; $350K+ purchase-price savings via CMA and Excel financial modeling.",
        "Built Excel + R Shiny holding-period models (rates, amortization, cost segregation, taxes, appreciation) plus owner-ready underwriting packs.",
        "Owned P&L for 30 rental units — tenants, owners, contractors, municipal compliance — and maintained high occupancy.",
        "Tracked rent rolls, tickets, and contractor spend in Excel; translated models into plain-language owner updates.",
      ],
    },
    {
      id: "independent",
      role: "Quantitative Analyst",
      org: "Independent Practice",
      location: "Remote / Berkeley, CA",
      start: "Nov 2021",
      end: "Dec 2023",
      highlights: [
        "Built proprietary analytics software using MLE and regression for behavioral patterns from small samples.",
        "Applied Bayesian updating for sparse data with documented assumptions; used Git/GitHub for reproducible experiments.",
        "Applied game theory and risk-management rules (position sizing, stop criteria) in probabilistic live settings; funded university expenses systematically.",
      ],
    },
  ],
  education: {
    school: "University of California, Berkeley",
    degree: "Bachelor of Arts — Statistics",
    period: "Aug 2019 – Dec 2023",
    notes: [
      "STAT 198 Head Instructor — Poker Theory and Fundamentals; 400+ students across 3 semesters (Spring 2022 – Fall 2023); largest DeCal at UC Berkeley",
      "Map the System, Oxford University (Summer 2022) — “Algorithmic Bias in Online Hiring Systems”",
      "Berkeley Venture Capital Group — startup evaluation and outreach",
    ],
  },
  projects: [
    {
      id: "gtm-system",
      title: "GTM Outreach Operating System",
      tag: "Workflow engineering",
      href: "https://navigara.com",
      blurb:
        "Shared outreach infrastructure for SDR, marketing, and sales with explicit sequencing, handoffs, stage visibility, and repeatable playbooks.",
      methods: ["Automation", "Stage design", "Documentation"],
      artifact: "Operating workflow",
    },
    {
      id: "bayesian",
      title: "Bayesian Inference System",
      tag: "Sparse-data decisions",
      href: "https://medium.com/Douwes.theo",
      blurb:
        "Profiling tool for sparse-data decisions using Bayesian methods — assumptions documented, experiments reproducible.",
      methods: ["Bayesian updating", "Small samples", "Reproducibility"],
      artifact: "Public research notes",
    },
    {
      id: "re-tool",
      title: "Real Estate Analysis Tool",
      tag: "R Shiny",
      href: null,
      blurb:
        "Interactive R Shiny property investment model with tunable financial parameters for holding-period underwriting.",
      methods: ["R Shiny", "Scenario analysis", "Cash-flow modeling"],
      artifact: "Private analytical app",
    },
    {
      id: "zerocopy",
      title: "ZeroCopy.systems Prediction Market Pricing",
      tag: "15-minute binary markets",
      href: "https://tinyurl.com/video-live-bot",
      blurb:
        "Pricing for 15-minute binary outcome markets with fat-tailed adjustments, blended volatility, momentum signals, and systematic position sizing.",
      methods: ["Fat tails", "Volatility", "Position sizing"],
      artifact: "Public demo video",
    },
    {
      id: "tedx",
      title: "TEDx Lead Organizer",
      tag: "May 2018",
      href: null,
      blurb:
        "Led application, speaker selection, and production for an official TEDx event — 200K+ YouTube views.",
      methods: ["Program design", "Speaker selection", "Production"],
      artifact: "200K+ documented views",
    },
  ],
  writing: [
    {
      id: "bayes-medium",
      title: "Bayesian inference for sparse-data decisions",
      href: "https://medium.com/Douwes.theo",
      blurb:
        "Notes and frameworks on Bayesian updating under sparse data — the public home for the Bayesian Inference System write-ups.",
    },
  ],
  links: {
    linkedin: "https://www.linkedin.com/in/theo-douwes",
    github: "https://github.com/TheoDouwes",
    medium: "https://medium.com/Douwes.theo",
    navigara: "https://navigara.com",
    zeroCopy: "https://tinyurl.com/video-live-bot",
    email: "tadouwes@berkeley.edu",
    phone: "+1-858-663-3556",
  },
};

export function getExperienceById(
  id: string,
  items: readonly ExperienceItem[] = profile.experience,
): ExperienceItem | undefined {
  return items.find((item) => item.id === id);
}

export function formatTenure(start: string, end: string): string {
  return `${start} — ${end}`;
}

const MONTH_INDEX: Readonly<Record<string, number>> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseMonth(value: string): { year: number; month: number } | null {
  const [monthName, yearText] = value.trim().split(/\s+/);
  const month = MONTH_INDEX[monthName ?? ""];
  const year = Number(yearText);
  if (month === undefined || !Number.isInteger(year)) return null;
  return { year, month };
}

/** "Feb 2026" + "Present" → "6 mo"; "Nov 2021" + "Dec 2023" → "2 yr 2 mo". */
export function formatDuration(
  start: string,
  end: string,
  reference: Date = new Date(),
): string {
  const from = parseMonth(start);
  const to =
    end === "Present"
      ? { year: reference.getFullYear(), month: reference.getMonth() }
      : parseMonth(end);
  if (!from || !to) return "";
  const months = Math.max(
    1,
    (to.year - from.year) * 12 + (to.month - from.month) + 1,
  );
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}
