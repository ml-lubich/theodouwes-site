interface ConnectLinksProps {
  readonly linkedin: string;
  readonly github: string;
  readonly medium: string;
  readonly navigara: string;
  readonly zeroCopy: string;
  readonly email: string;
  readonly phone: string;
}

const LINKS: readonly {
  readonly key: keyof ConnectLinksProps;
  readonly label: string;
  readonly external?: boolean;
}[] = [
  { key: "linkedin", label: "LinkedIn", external: true },
  { key: "github", label: "GitHub", external: true },
  { key: "medium", label: "Medium", external: true },
  { key: "zeroCopy", label: "ZeroCopy demo", external: true },
  { key: "navigara", label: "Navigara", external: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

export function ConnectLinks(props: ConnectLinksProps) {
  return (
    <nav className="connect-links" aria-label="Profiles and contact">
      <ul className="connect-list">
        {LINKS.map(({ key, label, external }) => {
          const value = props[key];
          const href =
            key === "email"
              ? `mailto:${value}`
              : key === "phone"
                ? `tel:${value.replace(/-/g, "")}`
                : value;

          return (
            <li key={key}>
              <a
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="connect-label">{label}</span>
                <span className="connect-value">{value}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
