"use client";

import { Globe } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/inputs/select";
import { useProjectLocalesQuery } from "@/hooks/admin/localization";
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/hooks/admin/settings";
import { SettingsSection } from "./shared/SettingsSection";
import { useConsoleText } from "@/lib/admin/use-console-text";

/** Язык проекта по умолчанию: хранится в настройках сайта (auth-service). */
export function SiteLanguageSection() {
  const t = useConsoleText();
  const { data: settings } = useSiteSettingsQuery();
  const { data: locales = [] } = useProjectLocalesQuery();
  const update = useUpdateSiteSettingsMutation();

  const options = (locales.length > 0 ? locales : ["ru", "en"]).map((locale) => ({
    value: locale,
    label: locale.toUpperCase(),
  }));
  // текущий язык может не входить в локали проекта — тогда добавим его в список
  if (settings && !options.some((option) => option.value === settings.language)) {
    options.unshift({
      value: settings.language,
      label: settings.language.toUpperCase(),
    });
  }

  const changeLanguage = (language: string) => {
    if (!settings || language === settings.language) return;
    update.mutate(
      { ...settings, language },
      {
        onSuccess: () =>
          toast.success(
            t("console.settings.general.language-saved").replace(
              "{locale}",
              language.toUpperCase(),
            ),
          ),
        onError: (error: Error) =>
          toast.error(error.message || t("console.settings.save-failed")),
      },
    );
  };

  return (
    <SettingsSection
      icon={Globe}
      title={t("console.settings.general.language-title")}
      description={t("console.settings.general.language-description")}
    >
      <div className="max-w-xs">
        <Select
          label={t("console.settings.general.default-language")}
          options={options}
          value={settings?.language ?? ""}
          onChange={(event) => changeLanguage(event.target.value)}
          disabled={!settings || update.isPending}
        />
      </div>
    </SettingsSection>
  );
}
