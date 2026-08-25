import { Metadata } from "next";
import { AddProductForm } from "@/components/pages/products/pages/add/AddProductForm";
import {
  getAdminBrands,
  getAdminCategories,
  getAdminCollections,
  getAdminVariantConfigs,
} from "@/lib/admin/data-source/admin-data";

export const metadata: Metadata = {
  title: "Add Product | Ætheria Admin",
  description: "Create a new luxury beauty product in the store catalog.",
};

export default async function AddProductPage() {
  const [brands, categories, collections, variantGroups] = await Promise.all([
    getAdminBrands(),
    getAdminCategories(),
    getAdminCollections(),
    getAdminVariantConfigs(),
  ]);

  return (
    <AddProductForm
      brands={brands}
      categories={categories}
      collections={collections}
      variantGroups={variantGroups}
    />
  );
}
