import type { Metadata } from "next";

import { AddBlogForm } from "@/components/pages/blogs/pages/add/AddBlogForm";

export const metadata: Metadata = {
  title: "New Article · Ætheria Admin",
  description: "Write and publish a new editorial beauty journal article.",
};

export default function AddBlogPage() {
  return <AddBlogForm />;
}
