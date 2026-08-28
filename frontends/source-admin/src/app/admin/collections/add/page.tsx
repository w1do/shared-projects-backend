import type { Metadata } from "next";
import { AddCollectionForm } from "@/components/pages/collections/pages/add/AddCollectionForm";
import { getAdminProducts } from "@/lib/admin/data-source/admin-data";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.collections")} · Ætheria Admin`,
  description: t("console.meta.collections-add-description"),
};

export default async function AddCollectionPage() {
  const products = await getAdminProducts();
  return <AddCollectionForm products={products} />;
}
