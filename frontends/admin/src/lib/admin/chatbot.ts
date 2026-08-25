/**
 * Helper to generate mock replies and suggestions for Aetheria Workspace Assistant.
 * All logic and content are in English as per language rules.
 */
export const SUGGESTIONS = [
  { label: "Sales Report", query: "sales", icon: "TrendingUp" },
  { label: "Order #1204", query: "order #1204", icon: "Package" },
  { label: "Best Sellers", query: "best sellers", icon: "Sparkles" },
  { label: "Support Tickets", query: "support tickets", icon: "Ticket" },
];

export function getBotReply(query: string): string {
  const cleanQuery = query.toLowerCase().trim();

  if (cleanQuery.includes("sales") || cleanQuery.includes("revenue")) {
    return "Today's sales are currently at **$14,205.80**, showing a **+12.4%** increase compared to yesterday. Aetheria Ateliers are performing exceptionally well, with *Private Skin Rituals* leading the sales with 82 orders processed.";
  }
  if (cleanQuery.includes("order")) {
    return "Order **#1204** by *Eleanor Vance* (Total: **$248.00**) is currently **In Transit**. It was dispatched via DHL Express today at 10:30 AM and is expected to deliver tomorrow afternoon.";
  }
  if (
    cleanQuery.includes("product") ||
    cleanQuery.includes("best seller") ||
    cleanQuery.includes("best")
  ) {
    return "Today's top-performing products:\n\n1. **Barrier Repair Balm** (Aetheria Lab) — 142 units\n2. **Nectar Infusion Serum** (Saffron & Co.) — 98 units\n3. **Ritual Cleansing Milk** (Aetheria Lab) — 84 units\n\nAll items are well stocked at current run rates.";
  }
  if (cleanQuery.includes("ticket") || cleanQuery.includes("support")) {
    return "There are currently **3 open support tickets** requiring immediate attention:\n\n• **#TK-904**: Payment failure inquiry by Marcus G.\n• **#TK-905**: Custom formulation guidance by Sophia K.\n• **#TK-906**: Shipment delay (EU region)\n\nLet me know if you would like me to navigate you to the Support dashboard.";
  }
  return "I can help you monitor shop analytics, check orders, track products, and manage support tickets. Ask me about **sales**, **best sellers**, **order #1204**, or **support tickets**!";
}
