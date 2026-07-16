export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theo-theme";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "dark" || value === "light";
}

/** Prefer stored choice; else system preference; else dark. */
export function resolveInitialTheme(input: {
  readonly stored: string | null | undefined;
  readonly prefersLight: boolean;
}): Theme {
  if (isTheme(input.stored)) return input.stored;
  return input.prefersLight ? "light" : "dark";
}

export function toggleTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

/** Wireframe brain color: white on dark field, black on light field. */
export function brainColorForTheme(theme: Theme): string {
  return theme === "light" ? "#000000" : "#ffffff";
}
