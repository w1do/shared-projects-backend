import { adminApiSend } from "../api-client";
import type { ApiProduct } from "../api-types";
import { enumValue, slugify } from "./shared";
import { semanticColors } from "@/lib/theme-colors";

export const productMutations = {
  createProduct: (body: {
    name: string;
    brandId: string;
    categoryId: string;
    price: number;
    status: string;
    imageUrl?: string;
    gradientStart?: string;
    gradientEnd?: string;
    sku: string;
    stockQuantity?: number;
  }) =>
    adminApiSend<ApiProduct>("/api/v1/products", {
      method: "POST",
      body: {
        slug: slugify(body.name),
        name: body.name,
        brandId: body.brandId,
        categoryId: body.categoryId,
        price: body.price,
        status: enumValue(body.status),
        imageUrl: body.imageUrl || null,
        gradientStart: body.gradientStart ?? semanticColors.accent,
        gradientEnd: body.gradientEnd ?? semanticColors.brandAccentHover,
      },
    }).then(async (product) => {
      await adminApiSend(`/api/v1/products/${product.id}/variants`, {
        method: "POST",
        body: {
          sku: body.sku,
          price: body.price,
          stockQuantity: body.stockQuantity ?? 0,
          attributes: {},
          inventoryOnHand: body.stockQuantity ?? 0,
          inventoryIncoming: 0,
          inventoryThreshold: 10,
          inventoryLocation: "Main warehouse",
        },
      });
      return product;
    }),
  updateProduct: (
    id: string,
    body: {
      name: string;
      brandId: string;
      categoryId: string;
      price: number;
      status: string;
      imageUrl?: string;
      gradientStart?: string;
      gradientEnd?: string;
    },
  ) =>
    adminApiSend<ApiProduct>(`/api/v1/products/${id}`, {
      method: "PUT",
      body: {
        slug: slugify(body.name),
        name: body.name,
        brandId: body.brandId,
        categoryId: body.categoryId,
        price: body.price,
        status: enumValue(body.status),
        imageUrl: body.imageUrl || null,
        gradientStart: body.gradientStart ?? semanticColors.accent,
        gradientEnd: body.gradientEnd ?? semanticColors.brandAccentHover,
      },
    }),
  deleteProduct: (id: string) => adminApiSend<void>(`/api/v1/products/${id}`, { method: "DELETE" }),
};
