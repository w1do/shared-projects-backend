import { Metadata } from "next";
import { EditCollectionForm } from "@/components/pages/collections/pages/edit/EditCollectionForm";
import { getAdminCollectionById, getAdminProducts } from "@/lib/admin/data-source/admin-data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Collection ${id} | Ætheria Admin`,
    description: `Edit collection "${id}" cover art, merchandising metrics, and curated products.`,
  };
}

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params;
  const [collection, products] = await Promise.all([
    getAdminCollectionById(id),
    getAdminProducts(),
  ]);
  return (
    <EditCollectionForm collectionId={id} initialCollection={collection} products={products} />
  );
}
