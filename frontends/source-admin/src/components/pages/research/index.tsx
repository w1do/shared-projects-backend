"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { t } from "@/lib/admin/console-texts";
import { useConsoleAccessQuery } from "@/hooks/admin/project";

import { ResearchListSection } from "./sections/ResearchListSection";
import { ResearchDetailSection } from "./sections/ResearchDetailSection";

/** Раздел «Ресёрч»: список исследований и карточка выбранного с темами. */
export default function ResearchPage() {
  const { data: access } = useConsoleAccessQuery();
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("console.research.title")}
        description={t("console.research.subtitle")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.research.title") },
        ]}
      />

      {selected === null ? (
        <ResearchListSection
          canRun={access?.canRunResearch ?? false}
          onOpen={setSelected}
        />
      ) : (
        <ResearchDetailSection
          researchId={selected}
          canRun={access?.canRunResearch ?? false}
          canManageTopics={access?.canManageTopics ?? false}
          canGeneratePosts={access?.canGeneratePosts ?? false}
          onBack={() => setSelected(null)}
        />
      )}
    </div>
  );
}
