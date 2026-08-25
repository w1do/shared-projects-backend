import { shouldUseAdminApi } from "@/lib/admin/data-source/config";

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
      writeReason:
        "Campaigns API is not implemented on the backend yet. Switch to mock data source or add /api/v1/campaigns server-side.",
    };
  }
  return { read: true, write: true, autoFill: true };
}

export function getSettingsCapabilities(): DomainCapability {
  if (shouldUseAdminApi()) {
    return {
      read: true,
      write: false,
      autoFill: false,
      writeReason:
        "Store settings are read-only over the API (GET only). Changes are not persisted to the server in this template build.",
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
      writeReason:
        "Landing/homepage content is mock-only. API mode lists static storefront pages without LANDING.",
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
