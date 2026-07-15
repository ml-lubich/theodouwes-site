export interface ExperienceItem {
  readonly id: string;
  readonly role: string;
  readonly org: string;
  readonly location: string;
  readonly start: string;
  readonly end: string;
  readonly highlights: readonly string[];
}

export interface FeaturedItem {
  readonly id: string;
  readonly title: string;
  readonly outlet: string;
  readonly href: string;
  readonly blurb: string;
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
  readonly photoSrc: string;
  readonly photoAlt: string;
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
  readonly featured: readonly FeaturedItem[];
  readonly writing: readonly WritingItem[];
  readonly links: {
    readonly linkedin: string;
    readonly medium: string;
    readonly navigara: string;
  };
}

export const profile: SiteProfile = {
  name: "Theo Alexander Douwes",
  shortName: "Theo Douwes",
  monogram: "TD",
  title: "AI Transformation @ Navigara | Stats Researcher",
  location: "San Francisco Bay Area",
  headline: "Quantifying developer productivity into business outcomes.",
  subhead:
    "Engineering ships more code every year. Most leaders still cannot prove how much of it mattered — or whether AI tooling moved the business.",
  photoSrc: "/theo.webp",
  photoAlt: "Portrait of Theo Alexander Douwes",
  signals: ["Navigara", "UC Berkeley Stats", "ETV Research", "AI ROI"],
  stats: [
    { value: "116%", label: "Big-tech production lift studied" },
    { value: "51%", label: "ETV rise vs commit volume" },
    { value: "300+", label: "Students taught at Berkeley" },
    { value: "50+", label: "Countries traveled" },
  ],
  skills: [
    "AI Strategy",
    "Engineering Throughput Value",
    "Bayesian Inference",
    "R",
    "SQL",
    "Pandas",
    "Game Theory",
    "Statistics",
  ],
  about: [
    "I research engineering performance. Sales has a CRM. Marketing has a dashboard. Engineering managers often have a gut feeling and a prayer. At Navigara, we replace intuition with deterministic, rigorously tested formulas that translate codebase change into executive-ready signal.",
    "US companies spent billions on AI coding tools in 2024. The recurring boardroom question has no clean answer yet: Are we faster? More efficient? Is any of this moving the business forward? Navigara’s Engineering Throughput Value (ETV) framework measures both quantity and complexity of contributions — not vanity commit counts.",
    "Having traveled to over 50 countries and spent 40 days in Vipassana silence, I am reminded that the human spirit powers our best work. Respect and cooperation are not soft extras; they are how capability compounds.",
  ],
  experience: [
    {
      id: "navigara",
      role: "Open-source Researcher · AI Transformation",
      org: "Navigara",
      location: "San Francisco Bay Area",
      start: "Apr 2026",
      end: "Present",
      highlights: [
        "Bridge engineering leaders from developer productivity metrics to C-suite communication",
        "Quantify token-spend from individual developers to org-wide repositories",
        "Connect GitHub, GitLab, Bitbucket, and Azure DevOps with read-only access",
        "Align codebase changes to initiatives via issue trackers, CRM, and observability",
      ],
    },
    {
      id: "zerocopy",
      role: "Quantitative Developer",
      org: "ZeroCopy Systems",
      location: "Remote",
      start: "Nov 2025",
      end: "Feb 2026",
      highlights: [
        "Built quantitative systems at the intersection of data, inference, and decision-making",
        "Applied statistical rigor outside traditional finance",
      ],
    },
    {
      id: "break",
      role: "Career break · Field research on attention",
      org: "Personal",
      location: "Himalayas & Vipassana centers",
      start: "Oct 2024",
      end: "Sep 2025",
      highlights: [
        "Hiking in the Himalayas as a deliberate reset",
        "40 days of silence at Vipassana Meditation centers before re-entering the AI productivity wave",
      ],
    },
    {
      id: "re",
      role: "Real Estate Analyst, Manager",
      org: "Private",
      location: "United States",
      start: "Jan 2024",
      end: "Oct 2024",
      highlights: [
        "Full-time analysis and operations management for private real estate",
        "Capital allocation under uncertainty",
      ],
    },
    {
      id: "berkeley-instructor",
      role: "Course Instructor · Statistics & Game Theory",
      org: "University of California, Berkeley",
      location: "Berkeley, CA",
      start: "Jan 2022",
      end: "Dec 2023",
      highlights: [
        "STAT 198: Statistics & Game Theory in NLHE across three semesters",
        "Taught 300+ undergraduate and graduate students",
        "Blended Bayesian thinking with competitive strategy",
      ],
    },
  ],
  education: {
    school: "University of California, Berkeley",
    degree: "Bachelor of Arts — Statistics",
    period: "Aug 2019 – Dec 2023",
    notes: [
      "University of Oxford research showcase: Algorithmic Bias in AI Online Hiring Systems",
      "STAT 198 Course Instructor (Statistics & Game Theory)",
      "Berkeley Venture Capital Group",
      "Tau Kappa Epsilon (TKE)",
    ],
  },
  featured: [
    {
      id: "vb-etv",
      title:
        "A Navigara study found engineering production at six big-tech companies rose 116% in a year",
      outlet: "VentureBeat",
      href: "https://venturebeat.com/",
      blurb:
        "Commits per engineer rose 35%, but Engineering Throughput Value (ETV) rose 51% — more work, and more complex work. Data suggested capacity shifting from maintenance toward growth.",
    },
    {
      id: "nlr-advisors",
      title:
        "Navigara enlists Silicon Valley veterans behind 4 unicorns and $160B+ market cap",
      outlet: "The National Law Review",
      href: "https://www.natlawreview.com/",
      blurb:
        "Michael Selvidge and Michal Habdank-Kolaczkowski join the advisory board as Navigara expands US engineering-performance reporting.",
    },
  ],
  writing: [
    {
      id: "moat",
      title: "Stop Vibe-Coding, Start Moat-Building",
      href: "https://medium.com/",
      blurb:
        "Blindspots & Bottlenecks: a framework for founders to build where frontier models are blind — before your Series A feature becomes a native toggle.",
    },
    {
      id: "bayes-poker",
      title: "Bayesian Inference Beats Traditional Methods by 1.2x–10x",
      href: "https://medium.com/",
      blurb:
        "A Bayesian approach to opponent metrics in NLHE that outperforms industry-standard predictors — creative math applied beyond poker.",
    },
  ],
  links: {
    linkedin: "https://www.linkedin.com/in/theo-douwes",
    medium: "https://medium.com/",
    navigara: "https://navigara.com",
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
