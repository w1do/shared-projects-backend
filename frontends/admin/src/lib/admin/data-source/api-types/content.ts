export type ApiNotification = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  read?: boolean;
  href?: string | null;
  createdAt?: string;
};

export type ApiSupportTicket = {
  id: string;
  code: string;
  customer?: { name: string; email: string };
  subject: string;
  status: string;
  priority?: string;
  channel?: string | null;
  assignee?: string | null;
  messageCount?: number;
  messages?: Array<{
    id: string;
    author: string;
    authorName?: string | null;
    body: string;
    sentAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  category?: string | null;
  tags?: string[];
  authorName?: string | null;
  readingTimeMin: number;
  thumbnail?: string | null;
  banner?: string | null;
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED" | "ARCHIVED";
  /** Идентификаторы категорий проекта, к которым привязан пост. */
  categoryIds?: string[];
  contentBlocks?: Array<{ type?: string; content?: string; url?: string; images?: string[] }>;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
