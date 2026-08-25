import type { Campaign } from "./types";

export const initialCampaigns: Campaign[] = [
  {
    id: "camp-spring-glow",
    name: "Spring Glow Launch 2026",
    description:
      "Launch of the new high-potency serum line featuring brightening and light-refracting technologies.",
    status: "Active",
    channel: "Instagram + TikTok",
    budget: 15000,
    revenue: 88400,
    views: 13420,
    roas: 5.9,
    startsAt: "2026-05-20",
    endsAt: "2026-06-18",
    promotionIds: ["promo-glow25"],
    collectionIds: ["col-radiant-glow"],
    banner:
      "https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=450",
    thumbnail:
      "https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=300&h=300",
    performanceTrend: [20, 35, 45, 40, 55, 60, 58, 65, 72, 78, 85, 88],
    conversions: 1820,
    cap: 2500,
    spend: 15000,
  },
  {
    id: "camp-arctic-hydration",
    name: "Arctic Hydration Push",
    description:
      "Deep sea and glacial moisture barrier push during seasonal environmental dry transitions.",
    status: "Active",
    channel: "Email + Search",
    budget: 8000,
    revenue: 134200,
    views: 15080,
    roas: 16.7,
    startsAt: "2026-05-28",
    endsAt: "2026-06-12",
    promotionIds: ["promo-arctic15", "promo-shipfree"],
    collectionIds: ["col-deep-hydration", "col-marine-vitality"],
    banner:
      "https://images.unsplash.com/photo-1765964492963-b0aa8c172431?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=450",
    thumbnail:
      "https://images.unsplash.com/photo-1765964492963-b0aa8c172431?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=300&h=300",
    performanceTrend: [30, 42, 50, 48, 55, 52, 60, 68, 75, 82, 90, 95],
    conversions: 780,
    cap: 1000,
    spend: 8000,
  },
  {
    id: "camp-midnight-recovery",
    name: "Midnight Recovery Glow",
    description:
      "Night oil and skin barrier repair campaign targeted for overnight hydration rituals.",
    status: "Scheduled",
    channel: "Push + SMS",
    budget: 5000,
    revenue: 0,
    views: 7640,
    roas: 0,
    startsAt: "2026-06-20",
    endsAt: "2026-07-04",
    promotionIds: ["promo-velvet30"],
    collectionIds: ["col-midnight-recovery"],
    banner:
      "https://images.unsplash.com/photo-1615217482184-5ace6e36686a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=450",
    thumbnail:
      "https://images.unsplash.com/photo-1615217482184-5ace6e36686a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=300&h=300",
    performanceTrend: [10, 15, 12, 18, 22, 25, 20, 24, 30, 35, 38, 40],
    conversions: 0,
    cap: 800,
    spend: 0,
  },
  {
    id: "camp-summer-aromatherapy",
    name: "Summer Aromatherapy Edit",
    description:
      "Mindfulness and aromatherapeutic lifestyle launch incorporating sensory candles and oils.",
    status: "Draft",
    channel: "On-site Banner",
    budget: 3000,
    revenue: 0,
    views: 420,
    roas: 0,
    startsAt: "2026-07-10",
    endsAt: "2026-07-25",
    promotionIds: ["promo-bloomgift"],
    collectionIds: ["col-aromatherapy-wellness"],
    banner:
      "https://images.unsplash.com/photo-1593986815100-7d0772982da4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=450",
    thumbnail:
      "https://images.unsplash.com/photo-1593986815100-7d0772982da4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=300&h=300",
    performanceTrend: [5, 8, 12, 10, 15, 12, 18, 22, 25, 24, 28, 30],
    conversions: 0,
    cap: 500,
    spend: 0,
  },
];
