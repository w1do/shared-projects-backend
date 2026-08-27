import type { Metadata } from "next";

import { EditBlogForm } from "@/components/pages/blogs/pages/edit/EditBlogForm";
import { t, tf } from "@/lib/admin/console-texts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${t("console.blogs.form.edit-title")} · Ætheria Admin`,
    description: tf("console.meta.blogs-edit-description", { slug }),
  };
}

/**
 * Client-driven: no SSR seed. Server rendering cannot fetch here — the data
 * layer resolves the current project from a browser cookie, absent during SSR.
 */
export default async function EditBlogPage({ params }: Props) {
  const { slug } = await params;
  return <EditBlogForm slug={slug} />;
}
