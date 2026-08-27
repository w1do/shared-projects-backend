import type { Metadata } from "next";

import { AddBlogForm } from "@/components/pages/blogs/pages/add/AddBlogForm";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.blogs.new-article")} · Ætheria Admin`,
  description: t("console.meta.blogs-add-description"),
};

export default function AddBlogPage() {
  return <AddBlogForm />;
}
