"use client";

import Image from "next/image";
import { Clock, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import type { Article } from "@/lib/admin/types/magazine";
import { tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { formatArticleDate } from "@/components/pages/blogs/utils";

interface BlogsFeaturedProps {
  article: Article;
  onOpen: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export function BlogsFeatured({ article, onOpen, onEdit, onDelete }: BlogsFeaturedProps) {
  const t = useConsoleText();
  return (
    <div className="grid overflow-hidden rounded-3xl border border-border/60 bg-background shadow-subtle-3 lg:grid-cols-2">
      <div className="aspect-video relative overflow-hidden lg:h-full">
        <Image
          src={article.banner}
          alt={article.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-col justify-between gap-6 p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge color="accent" shape="circle">
              {t("console.blogs.featured-badge")}
            </Badge>
            <Badge color="muted" shape="circle">
              {article.category}
            </Badge>
          </div>
          <h2 className="font-openrunde text-heading-lg leading-tight tracking-tight text-foreground">
            {article.title}
          </h2>
          <p className="text-body text-muted-foreground text-line-2">{article.subtitle}</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar src={article.author.avatar} alt={article.author.name}>
                {article.author.name.slice(0, 1)}
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-semibold text-foreground">
                  {article.author.name}
                </span>
                <span className="truncate text-caption text-muted-foreground-lighter">
                  {article.author.role}
                </span>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-2 text-caption text-muted-foreground-lighter">
              <Clock className="size-4" />
              {tf("console.blogs.minutes", { count: article.readingTimeMin })} ·{" "}
              {formatArticleDate(article.publishedAt)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="contained"
              color="primary"
              shape="circle"
              size="md"
              endIcon={<ArrowUpRight />}
              onClick={() => onOpen(article)}
            >
              {t("console.blogs.read-article")}
            </Button>
            <IconButton
              type="button"
              shape="circle"
              variant="outlined"
              title={t("console.common.edit")}
              onClick={() => onEdit(article)}
            >
              <Pencil />
            </IconButton>
            <IconButton
              type="button"
              shape="circle"
              variant="outlined"
              title={t("console.common.delete")}
              onClick={() => onDelete(article)}
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
