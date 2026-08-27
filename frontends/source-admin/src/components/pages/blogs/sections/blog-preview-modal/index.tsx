"use client";

import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import type { Article } from "@/lib/admin/mocks/magazine";
import { tf } from "@/lib/admin/console-texts";
import { formatArticleDate } from "@/components/pages/blogs/utils";
import { ArticleContent } from "./components/ArticleContent";

interface BlogPreviewModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogPreviewModal({ article, isOpen, onClose }: BlogPreviewModalProps) {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="wide" padding="none" radius="3xl" scroll>
        <DialogHeader className="sr-only">
          <DialogTitle>{article.title}</DialogTitle>
          <DialogDescription>{article.subtitle}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-modal-scroll">
          <div className="aspect-video relative overflow-hidden">
            <img src={article.banner} alt={article.title} className="size-full object-cover" />
          </div>

          <div className="mx-auto flex max-w-prose flex-col gap-6 px-6 py-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge color="accent" shape="circle">
                  {article.category}
                </Badge>
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} color="muted" shape="circle">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="font-openrunde text-heading-lg leading-tight tracking-tight text-foreground">
                {article.title}
              </h1>
              <p className="text-body-lg text-muted-foreground">{article.subtitle}</p>

              <div className="flex items-center justify-between gap-4 border-y border-border/50 py-4">
                <div className="flex items-center gap-2">
                  <Avatar src={article.author.avatar} alt={article.author.name}>
                    {article.author.name.slice(0, 1)}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      {article.author.name}
                    </span>
                    <span className="text-caption text-muted-foreground-lighter">
                      {article.author.role}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-2 text-caption text-muted-foreground-lighter">
                  <Clock className="size-4" />
                  {tf("console.blogs.minutes", { count: article.readingTimeMin })} ·{" "}
                  {formatArticleDate(article.publishedAt)}
                </span>
              </div>
            </div>

            <ArticleContent blocks={article.contentBlocks} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
