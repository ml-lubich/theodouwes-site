# Requirements

## User stories

1. As a visitor, I see Theo’s name as the dominant brand signal in the first viewport.
2. As a visitor, I understand his focus: GTM systems, underwriting tools, and probabilistic decision software.
3. As a visitor, I can scan experience (Navigara → Piedmont → Independent) and education (UC Berkeley + STAT 198 / Oxford / Berkeley VC Group).
4. As a visitor, I can open projects (Medium, ZeroCopy demo) and writing links.
5. As a visitor, I can reach LinkedIn, email, and phone from the footer (LinkedIn also from the hero CTA).

## Hard constraints

- Next.js + Bun
- Content must match the resume-family fact ledger (no invented employers, degrees, $, %, or closed deals)
- Unit tests, integration tests, and Playwright e2e tests
- Deployable to Vercel
- Mobile and desktop readable layouts
- No hero cards, no dashboard clutter
- Framer Motion for hero / scroll reveals; respect `prefers-reduced-motion`

## Non-goals (v1)

- Blog engine / CMS
- Contact form backend
- Analytics dashboards
- Auth
- Resume PDF generation inside this repo
