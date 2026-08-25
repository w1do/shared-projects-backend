import type { Metadata } from "next";

import BlogsPage from "@/components/pages/blogs";

export const metadata: Metadata = {
  title: "Blogs · Ætheria Admin",
  description: "Publish editorial magazine stories, beauty guides, and brand journals.",
};

export default function BlogsPageRoute() {
  return <BlogsPage />;
}
