export type Theme = "dark" | "light";
export type ThemePref = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theo-theme";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "dark" || value === "light";
}

/** Anything unrecognised (null, tampered storage) means "follow the system". */
export function parsePref(raw: string | null | undefined): ThemePref {
  return isTheme(raw) ? raw : "system";
}

export function resolveTheme(pref: ThemePref, prefersLight: boolean): Theme {
  if (pref === "system") return prefersLight ? "light" : "dark";
  return pref;
}

/** Prefer stored choice; else system preference; else dark. */
export function resolveInitialTheme(input: {
  readonly stored: string | null | undefined;
  readonly prefersLight: boolean;
}): Theme {
  return resolveTheme(parsePref(input.stored), input.prefersLight);
}

export function toggleTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

/** Wireframe brain color: white on dark field, black on light field. */
export function brainColorForTheme(theme: Theme): string {
  return theme === "light" ? "#000000" : "#ffffff";
}

/** Inline pre-paint script. Mirrors parsePref + resolveTheme; theme.test.ts evaluates it. */
export const themeBootScript = `(function(){var d=document.documentElement,p="system";try{var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(s==="light"||s==="dark")p=s}catch(e){}var t=p==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):p;d.setAttribute("data-theme",t);d.style.colorScheme=t})();`;
