import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditProductPage } from "@/components/pages/products/pages/edit/EditProductPage";
import {
  getAdminBrands,
  getAdminCategories,
  getAdminCollections,
  getAdminProductById,
  getAdminVariantConfigs,
} from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProductById(id);
  return {
    title: product ? `Edit ${product.name} | Ætheria Admin` : "Edit Product | Ætheria Admin",
    description: "Update an existing luxury beauty product in the store catalog.",
  };
}

export default async function EditProductRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, brands, categories, collections, variantGroups] = await Promise.all([
    getAdminProductById(id),
    getAdminBrands(),
    getAdminCategories(),
    getAdminCollections(),
    getAdminVariantConfigs(),
  ]);

  // API mode: hard 404 when the backend has no product.
  // Mock mode: SSR may miss localStorage-only products — client query recovers them.
  if (!product && shouldUseAdminApi()) {
    notFound();
  }

  return (
    <EditProductPage
      productId={id}
      initialProduct={product}
      brands={brands}
      categories={categories}
      collections={collections}
      variantGroups={variantGroups}
    />
  );
}
