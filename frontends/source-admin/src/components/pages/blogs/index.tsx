"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { Article } from "@/lib/admin/mocks/magazine";
import { useBlogsPage } from "@/hooks/admin/articles";
import { BlogsStats } from "./sections/blogs-stats";
import { BlogsFeatured } from "./sections/blogs-featured";
import { BlogsPanel } from "./sections/blogs-panel";
import { BlogPreviewModal } from "./sections/blog-preview-modal";
import { BlogsLoadingState } from "./loading";
import { cn } from "@/lib/utils";

interface BlogsPageProps {
  initialArticles?: Article[];
}

/** Blogs page — list/delete/preview via useBlogsPage (TanStack Query). */
export default function BlogsPage({ initialArticles }: BlogsPageProps = {}) {
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

  const [isMockLoading, setIsMockLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMockLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = isPending || isMockLoading;

  return (
    <div className="relative min-h-screen w-full">
      {/* Skeleton Loading Layer (On top, blocks interactions when active) */}
      <div
        className={cn(
          "transition-opacity duration-500 absolute inset-x-0 top-0 z-50 bg-background pointer-events-none",
          showSkeleton ? "opacity-100" : "opacity-0 invisible",
        )}
      >
        <BlogsLoadingState />
      </div>

      {/* Actual Content Layer (Pre-rendered in the background so charts are loaded) */}
      <div
        className={cn(
          "transition-opacity duration-500",
          showSkeleton ? "opacity-0 pointer-events-none invisible" : "opacity-100",
        )}
      >
        <div className="flex flex-col gap-10">
          <PageHeader
            title="Blogs"
            description="Publish editorial beauty journals, ingredient guides, and brand stories."
            breadcrumbItems={[
              { label: "Admin", href: "/admin" },
              { label: "Workspace", href: "/admin/blogs" },
              { label: "Blogs" },
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
                New Article
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
