"use client";

import * as React from "react";
import { ImageOff, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Skeleton } from "@/components/ui/data-display/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { cn } from "@/lib/utils";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  importProjectMedia,
  searchProjectImages,
  type ImageSearchResult,
  type ProjectMedia,
} from "@/lib/admin/services";

type ImageSearchDialogProps = {
  open: boolean;
  /** Запрос по умолчанию — заголовок поста; оператор его правит. */
  initialQuery?: string;
  onClose: () => void;
  /** Изображение перенесено в медиатеку проекта и готово к подстановке. */
  onPick: (media: ProjectMedia) => void;
};

/**
 * Подбор изображения: поиск во внешней службе, выбор из выдачи и перенос
 * выбранного в медиатеку проекта. До выбора оператором пост не меняется.
 */
export function ImageSearchDialog({
  open,
  initialQuery = "",
  onClose,
  onPick,
}: ImageSearchDialogProps) {
  const t = useConsoleText();
  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<ImageSearchResult[] | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [importingLink, setImportingLink] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Диалог открывается с заголовком поста и чистой выдачей прошлого подбора.
  React.useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setResults(null);
    setError(null);
    setImportingLink(null);
  }, [open, initialQuery]);

  const isBusy = isSearching || importingLink !== null;

  const search = async () => {
    if (query.trim().length < 2) return;
    setIsSearching(true);
    setError(null);
    try {
      setResults(await searchProjectImages(query.trim()));
    } catch (reason) {
      setResults(null);
      setError((reason as Error).message || t("console.images.search-failed"));
    } finally {
      setIsSearching(false);
    }
  };

  const pick = async (result: ImageSearchResult) => {
    setImportingLink(result.link);
    setError(null);
    try {
      onPick(await importProjectMedia(result.link));
      onClose();
    } catch (reason) {
      setError((reason as Error).message || t("console.images.import-failed"));
    } finally {
      setImportingLink(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !isBusy && onClose()}>
      <DialogContent size="lg" radius="3xl" scroll data-testid="image-search-dialog">
        <DialogTitle className="text-heading-lg font-semibold">
          {t("console.images.title")}
        </DialogTitle>
        <DialogDescription className="mt-1 text-xs text-muted-foreground">
          {t("console.images.subtitle")}
        </DialogDescription>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void search()}
            placeholder={t("console.images.query-placeholder")}
            className="min-w-0 flex-1"
            data-testid="image-search-query"
          />
          <Button
            shape="circle"
            startIcon={isSearching ? <Loader2 className="animate-spin" /> : <Search />}
            disabled={isBusy || query.trim().length < 2}
            onClick={() => void search()}
            data-testid="image-search-submit"
          >
            {t("console.images.search")}
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-xs font-medium text-destructive" data-testid="image-search-error">
            {error}
          </p>
        )}

        <div className="mt-4 min-h-40">
          {isSearching && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={index} className="aspect-video w-full rounded-xl" />
              ))}
            </div>
          )}

          {!isSearching && results !== null && results.length === 0 && (
            <div
              className="flex flex-col items-center gap-2 py-10 text-center"
              data-testid="image-search-empty"
            >
              <ImageOff className="size-6 text-muted-foreground-lighter" />
              <p className="text-xs text-muted-foreground-lighter">{t("console.images.empty")}</p>
            </div>
          )}

          {!isSearching && results !== null && results.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3" data-testid="image-search-results">
              {results.map((result) => (
                <button
                  key={result.link}
                  type="button"
                  disabled={isBusy}
                  onClick={() => void pick(result)}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl border border-border/60 text-left transition-all hover:border-primary/40",
                    importingLink === result.link && "pointer-events-none opacity-60",
                  )}
                  data-testid="image-search-result"
                >
                  <span className="relative block aspect-video w-full bg-muted/50">
                    <img
                      src={result.thumbnail ?? result.link}
                      alt={result.source ?? ""}
                      className="h-full w-full object-cover"
                    />
                    {importingLink === result.link && (
                      <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Loader2 className="size-4 animate-spin text-foreground" />
                      </span>
                    )}
                  </span>
                  <span className="truncate px-4 py-2 text-caption text-muted-foreground-lighter">
                    {result.source ?? t("console.images.source-unknown")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!isSearching && results === null && !error && (
            <p className="py-10 text-center text-xs text-muted-foreground-lighter">
              {t("console.images.hint")}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outlined" shape="circle" size="sm" disabled={isBusy} onClick={onClose}>
            {t("console.common.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
