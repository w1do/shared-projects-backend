import type { Article } from "@/lib/admin/types/magazine";
import { t, type ConsoleTextKey } from "@/lib/admin/console-texts";

export interface CategoryOption {
  value: string;
  label: string;
}

/** Ключи подписей статусов поста; сравнение и фильтрация идут по значениям. */
const STATUS_LABEL_KEYS: Record<string, ConsoleTextKey> = {
  draft: "console.post-status.draft",
  scheduled: "console.post-status.scheduled",
  published: "console.post-status.published",
  archived: "console.post-status.archived",
};

/** Подпись статуса поста для чипов и списков; неизвестный статус остаётся как есть. */
export function articleStatusLabel(status: string): string {
  const key = STATUS_LABEL_KEYS[status];
  return key ? t(key) : status;
}

/** Build the category filter options from the article set. */
export function categoryOptions(articles: Article[]): CategoryOption[] {
  const unique = Array.from(new Set(articles.map((a) => a.category))).sort();
  return [
    { value: "all", label: t("console.blogs.filter.all-categories") },
    ...unique.map((c) => ({ value: c, label: c })),
  ];
}

export function filterArticles(
  articles: Article[],
  searchTerm: string,
  category: string,
  status = "all",
): Article[] {
  const query = searchTerm.trim().toLowerCase();
  return articles.filter((article) => {
    const matchesSearch =
      query === "" ||
      article.title.toLowerCase().includes(query) ||
      article.subtitle.toLowerCase().includes(query) ||
      article.author.name.toLowerCase().includes(query) ||
      article.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesCategory = category === "all" || article.category === category;
    const matchesStatus = status === "all" || article.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

/** Варианты отбора по статусу; только когда посты его несут (режим api). */
export function statusOptions(articles: Article[]): CategoryOption[] | null {
  if (!articles.some((article) => article.status)) return null;
  return [
    { value: "all", label: t("console.blogs.filter.all-statuses") },
    { value: "draft", label: t("console.post-status.draft") },
    { value: "scheduled", label: t("console.post-status.scheduled") },
    { value: "published", label: t("console.post-status.published") },
    { value: "archived", label: t("console.post-status.archived") },
  ];
}

export const formatArticleDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { month: "short", day: "numeric", year: "numeric" });
