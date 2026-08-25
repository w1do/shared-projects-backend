import { Metadata } from "next";
import { AddCategoryForm } from "@/components/pages/categories/pages/add/AddCategoryForm";

export const metadata: Metadata = {
  title: "Add Category | Ætheria Admin",
  description: "Create a new cosmetic catalog category with hierarchy and merchandising metrics.",
};

/**
 * Client-driven, same pattern as the categories list: no SSR seed.
 * Server rendering cannot fetch here — the data layer resolves the current
 * project from a browser cookie, which is absent during SSR.
 */
export default function AddCategoryPage() {
  return <AddCategoryForm />;
}
