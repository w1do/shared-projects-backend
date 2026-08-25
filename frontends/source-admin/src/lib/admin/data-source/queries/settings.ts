import type { StoreSettings } from "@/lib/admin/mocks/settings";
import { readStoredStoreSettings } from "@/lib/admin/settings/store";
import { adminApiGet } from "../api-client";
import { fromSource } from "./shared";

export async function getAdminStoreSettings() {
  return fromSource(
    async () => adminApiGet<StoreSettings>("/api/v1/settings"),
    readStoredStoreSettings,
  );
}
