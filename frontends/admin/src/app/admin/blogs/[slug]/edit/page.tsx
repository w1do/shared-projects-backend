import type { Metadata } from "next";

import { EditBlogForm } from "@/components/pages/blogs/pages/edit/EditBlogForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Edit Article · Ætheria Admin`,
    description: `Edit the editorial journal article "${slug}".`,
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
