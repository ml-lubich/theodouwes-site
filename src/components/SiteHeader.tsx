"use client";

import { useEffect, useId, useState } from "react";

interface SiteHeaderProps {
  readonly brand: string;
  readonly monogram: string;
}

const NAV_ITEMS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#writing", label: "Writing" },
] as const;

const DESKTOP_MQ = "(min-width: 721px)";

export function SiteHeader({ brand, monogram }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState<boolean | null>(null);
  const navId = useId();
  // Until matchMedia resolves, keep links interactive (desktop e2e / SSR).
  const menuCollapsed = desktop === false && !open;

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const sync = () => {
      setDesktop(media.matches);
      if (media.matches) {
        setOpen(false);
      }
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className={`nav-shell glass${open ? " is-open" : ""}`}>
        <div className="nav-top">
          <a className="brand-mark" href="#top" onClick={closeMenu}>
            <span className="brand-mono" aria-hidden="true">
              {monogram}
            </span>
            {brand}
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls={navId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((current) => !current)}
          >
            <span className="nav-toggle-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
        <nav
          id={navId}
          className="nav-panel"
          aria-label="Primary"
          aria-hidden={menuCollapsed}
          inert={menuCollapsed ? true : undefined}
        >
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={closeMenu}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
