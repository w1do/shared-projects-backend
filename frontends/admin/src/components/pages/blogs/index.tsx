"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { Article } from "@/lib/admin/types/magazine";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { useBlogsPage } from "@/hooks/admin/articles";
import { BlogsStats } from "./sections/blogs-stats";
import { BlogsFeatured } from "./sections/blogs-featured";
import { BlogsPanel } from "./sections/blogs-panel";
import { BlogPreviewModal } from "./sections/blog-preview-modal";

interface BlogsPageProps {
  initialArticles?: Article[];
}

/** Blogs page — list/delete/preview via useBlogsPage (TanStack Query). */
export default function BlogsPage({ initialArticles }: BlogsPageProps = {}) {
  const t = useConsoleText();
  const {
    articles,
    featured,
    rest,
    previewArticle,
    openPreview,
    closePreview,
    openEdit,
    openCreate,
    removeArticle,
    isPending,
  } = useBlogsPage(initialArticles !== undefined ? { initialArticles } : {});

  return (
    <div className="min-h-screen w-full">
      {/* Раздел показан сразу: данные подставляются в уже отрисованную страницу */}
      <div>
        <div className="flex flex-col gap-10">
          <PageHeader
            title={t("console.nav.blogs")}
            description={t("console.blogs.subtitle")}
            breadcrumbItems={[
              { label: t("console.common.breadcrumb-admin"), href: "/admin" },
              { label: t("console.nav.group.workspace"), href: "/admin/blogs" },
              { label: t("console.nav.blogs") },
            ]}
            actions={
              <Button
                variant="contained"
                color="primary"
                shape="circle"
                size="md"
                startIcon={<Plus />}
                onClick={openCreate}
              >
                {t("console.blogs.new-article")}
              </Button>
            }
          />

          <BlogsStats articles={articles} />

          {featured && (
            <BlogsFeatured
              article={featured}
              onOpen={openPreview}
              onEdit={openEdit}
              onDelete={removeArticle}
            />
          )}

          <BlogsPanel
            articles={rest}
            isLoading={isPending}
            onOpen={openPreview}
            onEdit={openEdit}
            onDelete={removeArticle}
          />

          <BlogPreviewModal
            article={previewArticle}
            isOpen={!!previewArticle}
            onClose={closePreview}
          />
        </div>
      </div>
    </div>
  );
}
