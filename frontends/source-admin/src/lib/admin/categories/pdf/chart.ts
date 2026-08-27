import { semanticColors } from "@/lib/theme-colors";

/** Small rounded gradient swatch used as the category glyph in the report table. */
export function generateCategorySwatchSvg(coverGradient: [string, string]): string {
  const [start, end] = coverGradient;
  const gradientId = `swatch-${Math.random().toString(36).slice(2, 9)}`;

  return `
    <svg width="28" height="28" viewBox="0 0 28 28" style="display: block;">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="28" height="28" rx="7" fill="url(#${gradientId})" />
    </svg>
  `;
}
