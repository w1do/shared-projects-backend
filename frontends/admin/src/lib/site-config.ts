/**
 * Single brand/config surface for template buyers.
 * Rebrand shell, auth, SEO, PDF, and storage by editing this file + logo assets.
 */

export const siteConfig = {
  brand: {
    name: "Ætheria",
    nameAscii: "Aetheria",
    monogram: "Æ",
    legalName: "Ætheria Ecommerce",
    tagline: "Multi-Brand Beauty Platform.",
    productLineDefault: "Ætheria Botanicals",
  },
  admin: {
    appTitle: "Ætheria Admin",
    suiteName: "Ætheria Admin Suite",
    shortLabel: "Studio · Admin",
    consoleDescription: "Premium dashboard for multi-brand beauty and skincare ecommerce.",
    version: "v1.2.0",
  },
  urls: {
    storefrontDefault: "https://aetheria.studio",
    supportEmail: "care@aetheria.studio",
    demoUserEmail: "you@aetheria.studio",
  },
  seo: {
    rootTitle: "Ætheria — Multi-brand beauty studio",
    rootDescription:
      "Ætheria Admin Suite provides a premium, UI8-ready dashboard for managing a multi-brand beauty and skincare ecommerce store.",
    titleTemplate: (page: string) => `${page} · Ætheria Admin`,
  },
  assets: {
    logoSrc: "/logo.svg",
    logoAlt: "Ætheria Logo",
  },
  pdf: {
    reportBrand: "ÆTHERIA",
    reportSubtitle: "Cosmetics Admin Platform",
    orgFooter: "Ætheria Luxury Beauty Group",
    filenamePrefix: "Aetheria",
  },
  storage: {
    keyPrefix: "aetheria-admin",
  },
  copy: {
    advisorName: "Aetheria Advisor",
    companionName: "Aetheria Workspace Companion",
    editorialAuthor: "Aetheria Editorial",
    signInTitle: "Sign in to Ætheria",
    showcaseTitle: "Ætheria Studio",
    stubEyebrow: "Ætheria · Admin",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Build a namespaced localStorage key: `${prefix}-${suffix}`. */
export function storageKey(suffix: string): string {
  return `${siteConfig.storage.keyPrefix}-${suffix}`;
}
