import { semanticColors } from "@/lib/theme-colors";

export interface GradientPreset {
  name: string;
  start: string;
  end: string;
}

/** Shared cover-gradient swatches used across taxonomy editors (categories, collections). */
export const gradientPresets: GradientPreset[] = [
  {
    name: "Terracotta Dusk",
    start: semanticColors.accent,
    end: semanticColors.brandAccent,
  },
  {
    name: "Sand Mist",
    start: semanticColors.muted,
    end: semanticColors.brandAccentHover,
  },
  {
    name: "Warm Earth",
    start: semanticColors.accent,
    end: semanticColors.primary,
  },
  {
    name: "Soft Steel",
    start: semanticColors.infoBg,
    end: semanticColors.primary,
  },
  {
    name: "Golden Dusk",
    start: semanticColors.successBg,
    end: semanticColors.warning,
  },
  {
    name: "Clay Rose",
    start: semanticColors.successBg,
    end: semanticColors.primary,
  },
];
