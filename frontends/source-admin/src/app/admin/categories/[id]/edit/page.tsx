import { Metadata } from "next";
import { EditCategoryForm } from "@/components/pages/categories/pages/edit/EditCategoryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Category ${id} | Ætheria Admin`,
    description: `Edit cosmetic catalog category "${id}" hierarchy and merchandising metrics.`,
  };
}

/**
 * Client-driven, same pattern as the categories list: no SSR seed.
 * Server rendering cannot fetch here — the data layer resolves the current
 * project from a browser cookie, which is absent during SSR.
 */
export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  return <EditCategoryForm categoryId={id} />;
}
