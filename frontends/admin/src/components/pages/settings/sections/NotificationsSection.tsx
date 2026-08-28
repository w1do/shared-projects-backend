"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/inputs/switch";
import type { NotificationPref } from "@/lib/admin/mocks/settings";
import { useSaveSettingsSectionMutation } from "@/hooks/admin/settings";
import { SettingsSection } from "./shared/SettingsSection";
import { useConsoleText } from "@/lib/admin/use-console-text";

type Channel = "email" | "push";

export function NotificationsSection({ initial }: { initial: NotificationPref[] }) {
  const t = useConsoleText();
  const [prefs, setPrefs] = useState<NotificationPref[]>(initial);
  const saveMutation = useSaveSettingsSectionMutation();

  const toggle = (id: string, channel: Channel, value: boolean) => {
    const next = prefs.map((p) => (p.id === id ? { ...p, [channel]: value } : p));
    setPrefs(next);
    saveMutation.mutate(
      { section: "notifications", value: next },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            toast.error(result.reason ?? t("console.settings.notifications.save-failed"));
            setPrefs(prefs);
            return;
          }
          toast.success(t("console.settings.notifications.saved"));
        },
        onError: () => {
          toast.error(t("console.settings.notifications.save-failed"));
          setPrefs(prefs);
        },
      },
    );
  };

  return (
    <SettingsSection
      icon={Bell}
      title={t("console.settings.notifications.title")}
      description={t("console.settings.notifications.description")}
    >
      <div className="flex items-center justify-end gap-6 px-4 text-caption font-semibold uppercase tracking-widest text-muted-foreground-lighter">
        <span className="flex items-center gap-2">
          <Mail className="size-4" /> {t("console.settings.notifications.email")}
        </span>
        <span className="flex items-center gap-2">
          <Smartphone className="size-4" /> {t("console.settings.notifications.push")}
        </span>
      </div>
      {prefs.map((pref) => (
        <div
          key={pref.id}
          className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/15 p-4 transition-colors duration-200 hover:border-border hover:bg-muted/30"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-medium text-foreground">{pref.label}</p>
            <p className="mt-2 text-caption text-muted-foreground">{pref.description}</p>
          </div>
          <div className="flex items-center gap-6">
            <Switch checked={pref.email} onCheckedChange={(v) => toggle(pref.id, "email", v)} />
            <Switch checked={pref.push} onCheckedChange={(v) => toggle(pref.id, "push", v)} />
          </div>
        </div>
      ))}
    </SettingsSection>
  );
}
