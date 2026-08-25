"use client";

import * as React from "react";
import { GeneralInfoSection } from "@/components/pages/blogs/pages/add/sections/general-info";
import { useCategoriesQuery } from "@/hooks/admin/categories";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { MediaSection } from "@/components/pages/blogs/pages/add/sections/media";
import { ContentBlocksSection } from "@/components/pages/blogs/pages/add/sections/content-blocks";
import { AuthorSection } from "@/components/pages/blogs/pages/add/sections/author";
import { StatusSection } from "@/components/pages/blogs/pages/add/sections/status";

/**
 * Shared two-column layout composing every blog form section.
 * Reused by both the add and edit article workflows.
 */
export function BlogFormBody({ sidebarExtra }: { sidebarExtra?: React.ReactNode }) {
  // Дерево категорий проекта для привязки поста — только в режиме api.
  const isApi = shouldUseAdminApi();
  const { data: categories } = useCategoriesQuery({ enabled: isApi });
  const platformCategories = React.useMemo(
    () =>
      isApi
        ? (categories ?? []).map((category) => ({
            id: category.id,
            name: category.name,
            depth: category.depth ?? 0,
            parentId: category.parentId ?? null,
          }))
        : undefined,
    [isApi, categories],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left column */}
      <div className="flex flex-col gap-8 lg:col-span-2">
        <GeneralInfoSection platformCategories={platformCategories} />
        <MediaSection />
        <ContentBlocksSection />
      </div>

      {/* Right column - sidebar */}
      <div className="lg:col-span-1">
        <div className="flex flex-col gap-6 lg:sticky lg:top-32">
          <AuthorSection />
          <StatusSection />
          {sidebarExtra}
        </div>
      </div>
    </div>
  );
}
