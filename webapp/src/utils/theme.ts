/** Resolves a CSS custom property to its current literal value (e.g. a hex color), for contexts (like exported SVG) that can't rely on live CSS variables. */
export function resolveCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
