import type { Article } from "@/lib/admin/mocks/magazine";

export interface CategoryOption {
  value: string;
  label: string;
}

/** Build the category filter options from the article set. */
export function categoryOptions(articles: Article[]): CategoryOption[] {
  const unique = Array.from(new Set(articles.map((a) => a.category))).sort();
  return [
    { value: "all", label: "All Categories" },
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
    { value: "all", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];
}

export const formatArticleDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
