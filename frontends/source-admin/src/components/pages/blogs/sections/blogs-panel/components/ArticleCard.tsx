"use client";

import Image from "next/image";
import { Clock, Eye, ImageOff, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import type { Article } from "@/lib/admin/mocks/magazine";
import { tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { articleStatusLabel, formatArticleDate } from "@/components/pages/blogs/utils";

interface ArticleCardProps {
  article: Article;
  onOpen: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export function ArticleCard({ article, onOpen, onEdit, onDelete }: ArticleCardProps) {
  const t = useConsoleText();
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-background text-left shadow-subtle-3 transition-all duration-300 hover:border-brand-accent/40">
      {/* Full-card open control: keyboard accessible without nesting buttons */}
      <Button
        type="button"
        variant="ghost"
        colors="surface"
        size="auto"
        shape="rectangle"
        onClick={() => onOpen(article)}
        className="absolute inset-0 z-0 h-auto w-auto cursor-pointer rounded-none p-0 hover:bg-transparent active:scale-100 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset focus-visible:ring-offset-0"
        aria-label={tf("console.blogs.open-article", { title: article.title })}
      />

      <div className="pointer-events-none aspect-thumb relative overflow-hidden">
        {/* Обложка приходит из медиатеки проекта; её отсутствие — единая заглушка. */}
        {article.thumbnail ? (
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground-lighter"
            data-testid="article-cover-placeholder"
          >
            <ImageOff className="size-6" />
            <span className="text-caption">{t("console.images.placeholder")}</span>
          </div>
        )}
        <div className="absolute left-4 top-4 z-10 rounded-full bg-background/85 backdrop-blur">
          <Badge color="neutral" variant="ghost" shape="circle">
            {article.category}
          </Badge>
          {article.status && (
            <Badge
              color={
                article.status === "published"
                  ? "success"
                  : article.status === "archived"
                    ? "neutral"
                    : "warning"
              }
              variant="soft"
              shape="circle"
              data-testid="article-status"
            >
              {articleStatusLabel(article.status)}
            </Badge>
          )}
        </div>

        {/* Hover/focus actions sit above the stretched open control */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center gap-4 bg-primary/30 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <div className="flex items-center gap-4">
            <IconButton
              type="button"
              size="sm"
              shape="circle"
              variant="contained"
              colors="surface"
              title={t("console.blogs.preview")}
              onClick={() => onOpen(article)}
            >
              <Eye />
            </IconButton>
            <IconButton
              type="button"
              size="sm"
              shape="circle"
              variant="contained"
              colors="surface"
              title={t("console.common.edit")}
              onClick={() => onEdit(article)}
            >
              <Pencil />
            </IconButton>
            <IconButton
              type="button"
              size="sm"
              shape="circle"
              variant="contained"
              colors="surface"
              title={t("console.common.delete")}
              onClick={() => onDelete(article)}
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <span className="font-openrunde text-subheading leading-tight text-foreground text-line-2">
            {article.title}
          </span>
          <span className="text-caption text-muted-foreground text-line-2">{article.subtitle}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/50 pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar size="sm" src={article.author.avatar} alt={article.author.name}>
              {article.author.name.slice(0, 1)}
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-caption font-semibold text-foreground">
                {article.author.name}
              </span>
              <span className="truncate text-caption text-muted-foreground-lighter">
                {formatArticleDate(article.publishedAt)}
              </span>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-caption text-muted-foreground-lighter">
            <Clock className="size-4" />
            {tf("console.blogs.minutes", { count: article.readingTimeMin })}
          </span>
        </div>
      </div>
    </div>
  );
}
