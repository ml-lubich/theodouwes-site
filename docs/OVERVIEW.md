# Overview

Personal marketing site for Theo Alexander Douwes.

**Audience:** GTM / sales engineering collaborators, quant and data hiring managers, and operators discovering Theo via LinkedIn or referral.

**Job of the site:** present documented outcomes only — GTM outreach systems at Navigara, multifamily underwriting at Piedmont Realty ($5.88M acquisitions, $350K+ savings, 30 units), independent quant practice, STAT 198 teaching (400+ students), and selected projects (Bayesian tooling, ZeroCopy pricing demo, TEDx). Indexable via sitemap/robots/`llms.txt` and a categorized skills catalog (desktop Skill Storm is visual only).

**TheoAI** is an on-site chat assistant (bottom-right launcher) that answers visitor questions about Theo's experience, education, projects, writing and skills — grounded entirely in `src/lib/profile.ts` / `src/lib/skills.ts` via tool calls, with chart and Mermaid-diagram output and a contact hand-off card. See `docs/API.md` for the endpoint contract.
