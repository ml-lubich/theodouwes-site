# Requirements

## User stories

1. As a visitor, I see Theo’s name as the dominant brand signal in the first viewport.
2. As a visitor, I understand his focus: GTM systems, underwriting tools, and probabilistic decision software.
3. As a visitor, I can scan experience (Navigara → Piedmont → Independent) and education (UC Berkeley + STAT 198 / Oxford / Berkeley VC Group).
4. As a visitor, I can open projects (Medium, ZeroCopy demo) and writing links.
5. As a visitor, I can reach LinkedIn, GitHub, Medium, email, and phone from Connect + footer (LinkedIn also from the hero CTA).
6. As a crawler/LLM, I can read `robots.txt`, `sitemap.xml`, `llms.txt`, and Person JSON-LD with publish-safe facts.
7. As a visitor, I can toggle dark/light mode; light mode uses black text and a black wireframe brain.
8. As a visitor, I can open TheoAI (bottom-right) and ask about Theo's experience, education, projects, writing or skills, and get a markdown-formatted answer grounded only in what is already on the page — with charts, Mermaid diagrams, follow-up questions, and a contact hand-off card when I ask how to reach him. There is no booking calendar or resume download — this site has neither.

## Hard constraints

- Next.js + Bun
- Content must match the resume-family fact ledger (no invented employers, degrees, $, %, or closed deals)
- Skills inventory may include basics/concepts markers; do not invent Kubernetes / Spring / deep PyTorch ownership
- Unit tests, integration tests, and Playwright e2e tests
- Deployable to Vercel
- Mobile and desktop readable layouts (collapsible hamburger nav on small viewports)
- No hero cards, no dashboard clutter
- Framer Motion for hero / scroll reveals; respect `prefers-reduced-motion`
- Indexable SEO surface: metadata, Open Graph, Twitter cards, sitemap, robots (incl. major LLM bots), `llms.txt`
- Dark + light themes via `data-theme`; brain color follows theme (white/black)

## Non-goals (v1)

- Blog engine / CMS
- Contact form backend
- Analytics dashboards
- Auth
- Resume PDF generation inside this repo
- TheoAI booking calendar or resume hand-off — the site has neither, so the chat assistant does not either
