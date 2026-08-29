"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { t } from "@/lib/admin/console-texts";
import { useConsoleAccessQuery } from "@/hooks/admin/project";
import type { PlatformInstruct } from "@/lib/admin/services";

import { InstructListSection } from "./sections/instruct-list";
import { InstructFormSection } from "./sections/instruct-form";

/** Раздел «Инструкции»: правила генерации и схема ответа модели. */
export default function InstructsPage() {
  const { data: access } = useConsoleAccessQuery();
  const [editing, setEditing] = React.useState<PlatformInstruct | null>(null);
  const [creating, setCreating] = React.useState(false);

  const canManage = access?.canManageInstructs ?? false;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("console.instructs.title")}
        description={t("console.instructs.subtitle")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.instructs.title") },
        ]}
      />

      {creating || editing ? (
        <InstructFormSection
          instruct={editing}
          canManage={canManage}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      ) : (
        <InstructListSection
          canManage={canManage}
          onCreate={() => setCreating(true)}
          onEdit={setEditing}
        />
      )}
    </div>
  );
}
