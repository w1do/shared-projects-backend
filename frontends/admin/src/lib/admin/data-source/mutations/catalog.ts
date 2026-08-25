import { adminApiSend } from "../api-client";
import type { ApiBrand, ApiCategory, ApiCollection } from "../api-types";
import * as platformContent from "../platform/content";
import { categoryToApiCategory } from "../platform/mappers";
import { enumValue, slugify } from "./shared";

export const catalogMutations = {
  createBrand: (body: {
    name: string;
    monogram?: string;
    description?: string;
    thumbnail?: string;
  }) =>
    adminApiSend<ApiBrand>("/api/v1/brands", {
      method: "POST",
      body: {
        name: body.name,
        slug: slugify(body.name),
        monogram: body.monogram,
        logoUrl: body.thumbnail || null,
        story: body.description || "",
      },
    }),
  updateBrand: (
    id: string,
    body: { name: string; monogram?: string; description?: string; thumbnail?: string },
  ) =>
    adminApiSend<ApiBrand>(`/api/v1/brands/${id}`, {
      method: "PUT",
      body: {
        name: body.name,
        slug: slugify(body.name),
        monogram: body.monogram,
        logoUrl: body.thumbnail || null,
        story: body.description || "",
      },
    }),
  deleteBrand: (id: string) => adminApiSend<void>(`/api/v1/brands/${id}`, { method: "DELETE" }),
  // categories → content-service (nested set): создание, переименование, перемещение узла.
  createCategory: async (body: {
    name: string | Record<string, string>;
    slug: string;
    displayOrder: number;
    status: string;
    parentId?: string | null;
  }): Promise<ApiCategory> => {
    const created = await platformContent.createCategory({
      name: body.name,
      slug: body.slug,
      parent_id: body.parentId ? Number(body.parentId) : null,
    });
    return categoryToApiCategory(created, body.displayOrder);
  },
  updateCategory: async (
    id: string,
    body: {
      name: string | Record<string, string>;
      slug: string;
      displayOrder: number;
      status: string;
      parentId?: string | null;
    },
  ): Promise<ApiCategory> => {
    // `parent_id` уходит, только если родителя задали явно. Платформа трактует
    // присутствующее поле как указание: `null` означает «сделать корневым», и
    // прежняя безусловная отправка выбрасывала редактируемый узел в корень
    // вместе с поддеревом при обычном переименовании.
    const updated = await platformContent.updateCategory(Number(id), {
      name: body.name,
      slug: body.slug,
      ...("parentId" in body
        ? { parent_id: body.parentId == null ? null : Number(body.parentId) }
        : {}),
    });
    return categoryToApiCategory(updated, body.displayOrder);
  },
  /** Перемещение узла дерева: новый родитель и позиция среди сиблингов. */
  moveCategory: (id: string, parentId: string | null, position?: number) =>
    platformContent.moveCategory(Number(id), {
      parent_id: parentId === null ? null : Number(parentId),
      position,
    }),
  deleteCategory: (id: string) => platformContent.deleteCategory(Number(id)),
  createCollection: (body: {
    name: string;
    slug: string;
    description?: string;
    status: string;
    featured: boolean;
    products: string[];
  }) =>
    adminApiSend<ApiCollection>("/api/v1/collections", {
      method: "POST",
      body: {
        name: body.name,
        slug: body.slug,
        description: body.description || "",
        status: enumValue(body.status),
        featured: body.featured,
      },
    }).then(async (collection) => {
      if (body.products.length > 0) {
        await adminApiSend(`/api/v1/collections/${collection.id}/products`, {
          method: "PUT",
          body: { productIds: body.products },
        });
      }
      return collection;
    }),
  updateCollection: (
    id: string,
    body: {
      name: string;
      slug: string;
      description?: string;
      status: string;
      featured: boolean;
      products: string[];
    },
  ) =>
    adminApiSend<ApiCollection>(`/api/v1/collections/${id}`, {
      method: "PUT",
      body: {
        name: body.name,
        slug: body.slug,
        description: body.description || "",
        status: enumValue(body.status),
        featured: body.featured,
      },
    }).then(async (collection) => {
      await adminApiSend(`/api/v1/collections/${id}/products`, {
        method: "PUT",
        body: { productIds: body.products },
      });
      return collection;
    }),
  deleteCollection: (id: string) =>
    adminApiSend<void>(`/api/v1/collections/${id}`, { method: "DELETE" }),
  toggleCollectionFeatured: (id: string, featured: boolean) =>
    adminApiSend(`/api/v1/collections/${id}/featured`, { method: "PATCH", body: { featured } }),
};
