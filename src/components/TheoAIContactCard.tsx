"use client";

/**
 * Contact hand-off card. Same shape as a booking/resume card elsewhere in
 * the reference implementations — a header strip, a line of context, and
 * the real actions. The model is told not to paste the address or number,
 * so the card is the only place either appears.
 *
 * Nothing here sends mail. This hands over a `mailto:`, which opens the
 * visitor's own client with their own address on it; a form that posted
 * through the site would be an outbound channel with no sender.
 */

import type { ContactSpec } from "@/lib/ai/profile-tools";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6 8.5 7 8.5-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.55 4.78 5.87V21h-4v-5.7c0-1.36-.02-3.1-1.9-3.1-1.9 0-2.2 1.47-2.2 3v5.8H9z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

const CARD = "theoai-card";
const PRIMARY = "theoai-card-btn theoai-card-btn-primary";
const SECONDARY = "theoai-card-btn";

export function TheoAIContactCard({ contact }: { contact: ContactSpec }) {
  return (
    <figure className={CARD}>
      <div className="theoai-card-head">
        <p className="theoai-card-title">Get in touch</p>
      </div>

      <div className="theoai-card-body">
        <p className="theoai-card-name">{contact.name}</p>
        <p className="theoai-card-sub">{contact.title}</p>
        <p className="theoai-card-summary">{contact.summary}</p>

        <div className="theoai-card-actions">
          <a href={contact.mailto} className={PRIMARY}>
            <MailIcon />
            Email
          </a>
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
            <LinkedInIcon />
            LinkedIn
          </a>
          <a href={contact.github} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
            <GithubIcon />
            GitHub
          </a>
        </div>
      </div>
    </figure>
  );
}
