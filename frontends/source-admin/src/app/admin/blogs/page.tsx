import type { Metadata } from "next";

import BlogsPage from "@/components/pages/blogs";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.blogs")} · Ætheria Admin`,
  description: t("console.meta.blogs-description"),
};

export default function BlogsPageRoute() {
  return <BlogsPage />;
}
