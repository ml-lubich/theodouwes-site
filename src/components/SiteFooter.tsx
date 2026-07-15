interface SiteFooterProps {
  readonly name: string;
  readonly monogram: string;
  readonly linkedin: string;
  readonly github: string;
  readonly medium: string;
  readonly navigara: string;
}

export function SiteFooter({
  name,
  monogram,
  linkedin,
  github,
  medium,
  navigara,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p>
        © {year} {name} · {monogram}
      </p>
      <div className="footer-links">
        <a href={linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={medium} target="_blank" rel="noopener noreferrer">
          Medium
        </a>
        <a href={navigara} target="_blank" rel="noopener noreferrer">
          Navigara
        </a>
      </div>
    </footer>
  );
}
