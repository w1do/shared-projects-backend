import type { Article, ContentBlock } from "@/lib/admin/mocks/magazine";
import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import type { SupportTicket } from "@/lib/admin/mocks/support";
import type { ApiArticle, ApiNotification, ApiSupportTicket } from "../api-types";
import { semanticColors } from "@/lib/theme-colors";
import { initials, titleCase } from "./shared";

export function mapNotification(notification: ApiNotification): AdminNotification {
  return {
    id: notification.id,
    type: notification.type.toLowerCase() as AdminNotification["type"],
    title: notification.title,
    description: notification.description ?? "",
    href: notification.href ?? "/admin/notifications",
    read: Boolean(notification.read),
    createdAt: notification.createdAt ?? new Date().toISOString(),
  };
}

export function mapSupportTicket(ticket: ApiSupportTicket): SupportTicket {
  const createdAt = ticket.createdAt ?? new Date().toISOString();
  return {
    id: ticket.code,
    apiId: ticket.id,
    customer: {
      name: ticket.customer?.name ?? "Guest Customer",
      email: ticket.customer?.email ?? "guest@aetheria.local",
      initials: initials(ticket.customer?.name ?? "Guest Customer"),
      gradient: [semanticColors.accent, semanticColors.brandAccentHover],
    },
    subject: ticket.subject,
    status: titleCase(ticket.status) as SupportTicket["status"],
    priority: titleCase(ticket.priority ?? "NORMAL") as SupportTicket["priority"],
    channel: titleCase(ticket.channel ?? "Email") as SupportTicket["channel"],
    assignee: ticket.assignee ?? "Unassigned",
    unread: false,
    createdAt,
    updatedAt: ticket.updatedAt ?? createdAt,
    messages:
      ticket.messages?.map((message) => ({
        id: message.id,
        author: message.author.toLowerCase() as SupportTicket["messages"][number]["author"],
        authorName: message.authorName ?? "Aetheria",
        body: message.body,
        sentAt: message.sentAt ?? createdAt,
      })) ?? [],
  } as SupportTicket;
}

export function mapArticle(article: ApiArticle): Article {
  const contentBlocks: ContentBlock[] =
    article.contentBlocks?.map((block) => {
      if (block.type === "image") {
        return { type: "image_full" as const, url: block.content ?? block.url ?? "" };
      }
      if (block.type === "heading") {
        return { type: "heading" as const, level: 2, content: block.content ?? "" };
      }
      if (block.type === "quote") {
        return {
          type: "quote" as const,
          content: block.content ?? "",
          author: "Aetheria Editorial",
          style: "pull",
        };
      }
      return {
        type: "paragraph" as const,
        content: block.content ?? "",
      };
    }) ?? [];

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle ?? "",
    category: article.category ?? "Journal",
    tags: article.tags ?? [],
    author: {
      name: article.authorName ?? "Aetheria Editorial",
      role: "Editor",
      avatar: "AE",
    },
    readingTimeMin: article.readingTimeMin,
    publishedAt: article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
    banner: article.banner ?? article.thumbnail ?? "",
    thumbnail: article.thumbnail ?? article.banner ?? "",
    layoutStyle: "editorial",
    relatedProducts: [],
    contentBlocks,
  };
}
