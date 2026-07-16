/**
 * Honest skill bank for Theo’s site (resume-family inventory).
 * Items marked "(basics)" / "(concepts)" are adjacent/marketable — not years of production ownership.
 * Do not invent Kubernetes, React/Next production apps, Java/Spring, or deep PyTorch/TF pipelines.
 */

export interface SkillCategory {
  readonly category: string;
  readonly items: readonly string[];
}

export const skillCategories: readonly SkillCategory[] = [
  {
    category: "Roles & focus",
    items: [
      "Quantitative Analyst",
      "Software Engineer",
      "Data Analyst",
      "Data Scientist",
      "GTM / Sales Engineering",
      "Full-Stack Analytics",
      "Quant Research",
      "Risk",
      "BI",
      "Statistical ML",
    ],
  },
  {
    category: "Languages & tooling",
    items: [
      "Python",
      "R",
      "SQL",
      "Bash / shell",
      "JavaScript (basics)",
      "TypeScript (basics)",
      "Markdown",
      "Git / GitHub",
      "Linux CLI",
      "VS Code / Cursor",
      "Excel",
    ],
  },
  {
    category: "Python data / ML",
    items: [
      "pandas",
      "NumPy",
      "SciPy",
      "matplotlib",
      "seaborn",
      "Plotly (basics)",
      "scikit-learn",
      "statsmodels",
      "Jupyter",
      "requests",
      "pydantic (basics)",
      "pytest (basics)",
    ],
  },
  {
    category: "LLM / AI engineering",
    items: [
      "OpenAI API",
      "Anthropic API (basics)",
      "LangChain (basics)",
      "LlamaIndex (concepts)",
      "Prompt engineering",
      "Embeddings & RAG (concepts)",
      "Vector search (concepts)",
      "Hugging Face (basics)",
      "Structured outputs",
      "Tool / function calling (concepts)",
      "Streamlit AI demos",
    ],
  },
  {
    category: "Quant / stats methods",
    items: [
      "Probability",
      "EV / variance / utility",
      "MLE",
      "Bayesian inference",
      "GLM / regression",
      "Logistic regression",
      "Monte Carlo",
      "Bootstrap / resampling",
      "Hypothesis testing",
      "A/B testing (concepts)",
      "Time-series (basics)",
      "Confidence intervals",
      "Experimental design",
      "Feature engineering (basics)",
      "Kelly / bankroll thinking",
    ],
  },
  {
    category: "Markets / risk / underwriting",
    items: [
      "Fat tails",
      "Blended / realized vol",
      "Momentum signals",
      "Prediction-market microstructure",
      "Backtesting (concepts)",
      "Position sizing",
      "Drawdown controls",
      "Game theory",
      "Sharpe-style risk/reward",
      "CMA",
      "DCF-style cash flows",
      "Amortization",
      "Cost segregation",
      "Interest-rate scenarios",
      "Hold / sell analysis",
      "P&L",
    ],
  },
  {
    category: "Data apps / full-stack lite",
    items: [
      "Streamlit",
      "R Shiny",
      "Excel modeling / VBA / Pivot",
      "REST APIs (JSON / CSV / HTTP)",
      "HTML / CSS (basics)",
      "FastAPI (basics)",
      "KPI dashboards",
      "ETL / data cleaning / validation",
    ],
  },
  {
    category: "Cloud, automation & ops",
    items: [
      "AWS",
      "DigitalOcean",
      "SSH",
      "cron",
      "Docker (basics)",
      "Outreach automation",
      "Reproducible experiment repos",
      "CI-friendly Git hygiene",
    ],
  },
  {
    category: "Domains",
    items: [
      "SaaS pipeline tooling",
      "Multifamily underwriting",
      "Portfolio operations",
      "Prediction markets",
      "Algorithmic bias research",
      "Probabilistic curriculum design",
    ],
  },
] as const;

export function flattenSkills(
  categories: readonly SkillCategory[] = skillCategories,
): readonly string[] {
  return Array.from(new Set(categories.flatMap((c) => [...c.items])));
}

export function getSkillCategory(
  skill: string,
  categories: readonly SkillCategory[] = skillCategories,
): string | undefined {
  return categories.find((c) => c.items.includes(skill))?.category;
}
