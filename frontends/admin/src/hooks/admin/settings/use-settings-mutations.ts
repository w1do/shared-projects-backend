"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StoreSettings } from "@/lib/admin/types/settings";
import { saveSettingsSection } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

export function useSaveSettingsSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      section,
      value,
    }: {
      section: keyof StoreSettings;
      value: StoreSettings[keyof StoreSettings];
    }) => saveSettingsSection(section, value as never),
    onSuccess: (result) => {
      if (result.settings) {
        queryClient.setQueryData(adminQueryKeys.settings.store(), result.settings);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.settings.all });
    },
  });
}
