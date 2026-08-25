import SupportPage from "@/components/pages/support";

export const metadata = {
  title: "Support · Ætheria Admin",
  description: "Resolve customer tickets, returns, and post-purchase requests in one place.",
};

/**
 * Client-driven support inbox (same pattern as brands/products/dashboard):
 * no SSR seed so useSupportTicketsQuery isPending can drive the full-page skeleton.
 */
export default function SupportPageRoute() {
  return <SupportPage />;
}
