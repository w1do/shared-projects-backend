import CollectionsPage from "@/components/pages/collections";

export const metadata = {
  title: "Collections | Ætheria Admin",
  description:
    "Group products into themed sets: seasonal drops, curated routines, and editorial bundles.",
};

/**
 * Client-driven collections list (same pattern as products/dashboard):
 * no SSR seed so useCollectionsQuery isPending can drive the full-page skeleton.
 */
export default function AdminCollectionsPage() {
  return <CollectionsPage />;
}
