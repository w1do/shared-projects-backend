import { adminApiSend } from "../api-client";
import type { ApiBrand, ApiCategory, ApiCollection } from "../api-types";
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
  createCategory: (body: { name: string; slug: string; displayOrder: number; status: string }) =>
    adminApiSend<ApiCategory>("/api/v1/categories", {
      method: "POST",
      body: {
        name: body.name,
        slug: body.slug,
        displayOrder: body.displayOrder,
        status: enumValue(body.status),
      },
    }),
  updateCategory: (
    id: string,
    body: {
      name: string;
      slug: string;
      displayOrder: number;
      status: string;
    },
  ) =>
    adminApiSend<ApiCategory>(`/api/v1/categories/${id}`, {
      method: "PUT",
      body: {
        name: body.name,
        slug: body.slug,
        displayOrder: body.displayOrder,
        status: enumValue(body.status),
      },
    }),
  deleteCategory: (id: string) =>
    adminApiSend<void>(`/api/v1/categories/${id}`, { method: "DELETE" }),
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
