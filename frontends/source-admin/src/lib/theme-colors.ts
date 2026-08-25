/**
 * Runtime color constants mirroring `src/theme.css`.
 * Use these for ApexCharts, PDF/HTML export, CSS-in-JS, and gradient data —
 * places that cannot consume Tailwind semantic utilities.
 */

/** Brand primitives (source palette). Prefer semanticColors in app code. */
export const brandColors = {
  terracottaDusk: "#ce6e44",
  terracottaBeam: "#e38c62",
  terracottaMist: "#fbf0eb",
  midnightInk: "#181925",
  graphiteVeil: "#666666",
  ash: "#999999",
  fog: "#bbbcc3",
  bone: "#e8e8e8",
  paper: "#ffffff",
  mintWhisper: "#def6e4",
  signalGreen: "#33c758",
  amberSpark: "#ffa600",
  cobaltPulse: "#2c78fc",
  magentaPop: "#d6409f",
  ember: "#ff3e00",
  chartBlue: "#bed5fe",
  inputDisabled: "#f8f8fa",
  warningDark: "#b25900",
} as const;

/** Semantic tokens — keep in sync with the Semantic tokens block in theme.css. */
export const semanticColors = {
  background: brandColors.paper,
  foreground: brandColors.midnightInk,
  card: brandColors.paper,
  cardForeground: brandColors.midnightInk,
  popover: brandColors.paper,
  popoverForeground: brandColors.midnightInk,
  primary: brandColors.midnightInk,
  primaryForeground: brandColors.paper,
  secondary: brandColors.bone,
  secondaryForeground: brandColors.midnightInk,
  muted: brandColors.bone,
  mutedForeground: brandColors.graphiteVeil,
  mutedForegroundLighter: brandColors.ash,
  accent: brandColors.terracottaMist,
  accentForeground: brandColors.midnightInk,
  brandAccent: brandColors.terracottaDusk,
  brandAccentHover: brandColors.terracottaBeam,
  destructive: brandColors.ember,
  destructiveForeground: brandColors.paper,
  border: brandColors.bone,
  borderHover: brandColors.fog,
  input: brandColors.bone,
  inputDisabled: brandColors.inputDisabled,
  ring: brandColors.terracottaDusk,
  success: brandColors.signalGreen,
  successBg: brandColors.mintWhisper,
  info: brandColors.cobaltPulse,
  infoBg: brandColors.chartBlue,
  warning: brandColors.amberSpark,
  warningForeground: brandColors.paper,
  warningDark: brandColors.warningDark,
  chart1: brandColors.terracottaBeam,
  chart2: brandColors.cobaltPulse,
  chart3: brandColors.magentaPop,
  chart4: brandColors.signalGreen,
  chart5: brandColors.amberSpark,
  chart6: brandColors.chartBlue,
} as const;

/** Default product/cover gradients expressed via semantic palette values. */
export const defaultGradients = {
  product: [semanticColors.muted, semanticColors.primary] as [string, string],
  productWarm: [semanticColors.accent, semanticColors.brandAccentHover] as [string, string],
  promotion: [semanticColors.accent, semanticColors.brandAccent] as [string, string],
  cover: [semanticColors.accent, semanticColors.brandAccent] as [string, string],
} as const;
