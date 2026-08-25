import { Metadata } from "next";
import { EditBrandForm } from "@/components/pages/brands/pages/edit/EditBrandForm";
import { getAdminBrandById } from "@/lib/admin/data-source/admin-data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Brand ${id.toUpperCase()} | Ætheria Admin`,
    description: `Edit luxury cosmetics brand portfolio entry for ${id.toUpperCase()}.`,
  };
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params;
  const brand = await getAdminBrandById(id);
  return <EditBrandForm brandId={id} initialBrand={brand} />;
}
