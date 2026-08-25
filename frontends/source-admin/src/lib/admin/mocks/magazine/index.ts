import articlesData from "./data.json";
import type { Article } from "./types";

export * from "./types";

export const mockArticles = articlesData as Article[];
