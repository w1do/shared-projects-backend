/**
 * Подготовка и уборка тестового контента.
 *
 * Категории убираются в `finally`: удаление категории снимает всё её поддерево
 * одной операцией платформы. Посты платформа удалять не умеет (маршрута DELETE
 * нет) — тестовый пост переводится в архив; из черновика архив недоступен по
 * статус-машине, поэтому перед архивом пост публикуется.
 */

import { env } from "./env";

const base = () => `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/content`;

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function json(response: Response, what: string): Promise<any> {
  if (!response.ok) {
    throw new Error(`${what}: HTTP ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: CategoryNode[];
};

export async function categoryTree(token: string): Promise<CategoryNode[]> {
  const response = await fetch(`${base()}/categories`, { headers: headers(token) });

  return (await json(response, "Дерево категорий")).data;
}

export function findCategory(nodes: CategoryNode[], name: string): CategoryNode | null {
  for (const node of nodes) {
    if (node.name === name) return node;
    const found = findCategory(node.children ?? [], name);
    if (found) return found;
  }

  return null;
}

export async function createCategory(
  token: string,
  name: string,
  slug: string,
  parentId: number | null = null,
): Promise<number> {
  const response = await fetch(`${base()}/categories`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ name, slug, parent_id: parentId }),
  });

  return (await json(response, `Создание категории ${name}`)).data.id;
}

/** Удаление снимает всё поддерево; отсутствие узла — не ошибка уборки. */
export async function deleteCategoryIfExists(token: string, id: number): Promise<void> {
  await fetch(`${base()}/categories/${id}`, { method: "DELETE", headers: headers(token) });
}

export async function postBySlug(token: string, slug: string): Promise<any | null> {
  const response = await fetch(`${base()}/posts`, { headers: headers(token) });
  const payload = await json(response, "Список постов");
  const items = Array.isArray(payload.data) ? payload.data : (payload.data.items ?? []);

  return items.find((post: any) => post.slug === slug) ?? null;
}

/** Убрать тестовый пост с глаз: черновик публикуется, затем архивируется. */
export async function archivePostIfExists(token: string, slug: string): Promise<void> {
  const post = await postBySlug(token, slug);
  if (!post || post.status === "archived") return;

  const setStatus = (status: string) =>
    fetch(`${base()}/posts/${post.id}/status`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ status }),
    });

  if (post.status !== "published") await setStatus("published");
  await setStatus("archived");
}
