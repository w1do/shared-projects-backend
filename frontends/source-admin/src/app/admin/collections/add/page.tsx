import { Metadata } from "next";
import { AddCollectionForm } from "@/components/pages/collections/pages/add/AddCollectionForm";
import { getAdminProducts } from "@/lib/admin/data-source/admin-data";

export const metadata: Metadata = {
  title: "Create Collection | Ætheria Admin",
  description:
    "Curate a new editorial collection with cover art, merchandising metrics, and products.",
};

export default async function AddCollectionPage() {
  const products = await getAdminProducts();
  return <AddCollectionForm products={products} />;
}
