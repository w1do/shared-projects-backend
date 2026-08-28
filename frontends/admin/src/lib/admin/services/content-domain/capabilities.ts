import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { t } from "@/lib/admin/console-texts";

/**
 * Domain capability flags for honest UI in mock vs API mode.
 * Components must use this (via services) instead of branching on shouldUseAdminApi.
 */

export type DomainCapability = {
  /** Reads are available (list/detail). */
  read: boolean;
  /** Creates/updates/deletes hit a real backend. */
  write: boolean;
  /** Auto-fill demo data is allowed (mock-only). */
  autoFill: boolean;
  /** Human-readable reason when write is false. */
  writeReason?: string;
};

/**
 * Service-layer dual-mode flag for forms that need id vs name option values.
 * Prefer this (or domain capabilities) over importing shouldUseAdminApi in UI.
 */
export function isAdminApiMode(): boolean {
  return shouldUseAdminApi();
}

export function getCatalogCapabilities(): DomainCapability {
  return { read: true, write: true, autoFill: !shouldUseAdminApi() };
}

export function getCampaignCapabilities(): DomainCapability {
  if (shouldUseAdminApi()) {
    return {
      read: true,
      write: false,
      autoFill: false,
      writeReason: t("console.capabilities.campaigns-no-backend"),
    };
  }
  return { read: true, write: true, autoFill: true };
}

export function getSettingsCapabilities(): DomainCapability {
  if (shouldUseAdminApi()) {
    return {
      read: true,
      write: true,
      autoFill: false,
      writeReason: t("console.capabilities.settings-partial"),
    };
  }
  return { read: true, write: true, autoFill: true };
}

export function getContentHomepageCapabilities(): DomainCapability {
  if (shouldUseAdminApi()) {
    return {
      read: false,
      write: false,
      autoFill: false,
      writeReason: t("console.capabilities.homepage-mock-only"),
    };
  }
  return { read: true, write: true, autoFill: true };
}

export function getArticlesCapabilities(): DomainCapability {
  return { read: true, write: true, autoFill: !shouldUseAdminApi() };
}

export function getPromotionsCapabilities(): DomainCapability {
  return { read: true, write: true, autoFill: !shouldUseAdminApi() };
}

export function getOpsCapabilities(): DomainCapability {
  return { read: true, write: true, autoFill: false };
}
