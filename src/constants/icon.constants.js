/**
 * Lucide icon scale for the `size` / `strokeWidth` props (they take numbers, not Tailwind classes).
 * When the icon is sized with classes instead (`w-4 h-4`, `stroke-1.75`), use those tokens.
 */
export const ICON_SIZE = Object.freeze({
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32,
});

// DESIGN.md: thin line icons, stroke 1.5–1.75
export const ICON_STROKE = Object.freeze({
  THIN: 1.5,
  DEFAULT: 1.75,
  BOLD: 3, // Small check marks that must stay legible
});
