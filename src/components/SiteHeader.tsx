interface SiteHeaderProps {
  readonly brand: string;
  readonly monogram: string;
}

export function SiteHeader({ brand, monogram }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="nav-shell glass">
        <a className="brand-mark" href="#top">
          <span className="brand-mono" aria-hidden="true">
            {monogram}
          </span>
          {brand}
        </a>
        <nav aria-label="Primary">
          <ul className="nav-links">
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#work">Work</a>
            </li>
            <li>
              <a href="#featured">Press</a>
            </li>
            <li>
              <a href="#writing">Writing</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
