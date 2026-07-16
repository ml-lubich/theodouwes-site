interface SiteFooterProps {
  readonly name: string;
  readonly monogram: string;
  readonly linkedin: string;
  readonly github: string;
  readonly medium: string;
  readonly navigara: string;
  readonly zeroCopy: string;
  readonly email: string;
  readonly phone: string;
}

export function SiteFooter({
  name,
  monogram,
  linkedin,
  github,
  medium,
  navigara,
  zeroCopy,
  email,
  phone,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p>
        © {year} {name} · {monogram}
      </p>
      <div className="footer-links">
        <a href={`mailto:${email}`}>{email}</a>
        <a href={`tel:${phone.replace(/-/g, "")}`}>{phone}</a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={medium} target="_blank" rel="noopener noreferrer">
          Medium
        </a>
        <a href={zeroCopy} target="_blank" rel="noopener noreferrer">
          ZeroCopy demo
        </a>
        <a href={navigara} target="_blank" rel="noopener noreferrer">
          Navigara
        </a>
      </div>
    </footer>
  );
}
