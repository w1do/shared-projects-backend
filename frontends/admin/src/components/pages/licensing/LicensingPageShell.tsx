"use client";

import { ReactNode } from "react";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { ConsoleTextKey } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";

type Props = {
  titleKey: ConsoleTextKey;
  descriptionKey: ConsoleTextKey;
  canManage: boolean;
  accessLoaded: boolean;
  children: ReactNode;
};

/** Общая обложка разделов лицензирования: шапка и предупреждение о правах. */
export function LicensingPageShell({
  titleKey,
  descriptionKey,
  canManage,
  accessLoaded,
  children,
}: Props) {
  const t = useConsoleText();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t(titleKey)}
        description={t(descriptionKey)}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.payments"), href: "/admin/payments" },
          { label: t(titleKey) },
        ]}
      />

      {accessLoaded && !canManage && (
        <p
          className="text-caption text-muted-foreground-lighter"
          data-testid="licensing-read-only"
        >
          {t("console.licensing.read-only")}
        </p>
      )}

      {children}
    </div>
  );
}
