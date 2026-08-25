import { Product, LowStock, Campaign } from "./types";
import { productsCatalog } from "./catalog";

const byUnitsSold = [...productsCatalog].sort((a, b) => b.unitsSold - a.unitsSold);

/** Top performers surfaced on the dashboard Best Sellers widget. */
export const bestSellers: Product[] = byUnitsSold.slice(0, 5).map((product) => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  category: product.category,
  sku: product.sku,
  price: product.price,
  unitsSold: product.unitsSold,
  revenue: product.revenue,
  gradient: product.gradient,
  image: product.image,
}));

/** Items that have dropped below a healthy stock level. */
export const lowStock: LowStock[] = productsCatalog
  .filter((product) => product.stockStatus !== "In Stock")
  .sort((a, b) => a.stock - b.stock)
  .slice(0, 5)
  .map((product) => ({
    id: `ls-${product.id}`,
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    unitsLeft: product.stock,
    threshold: 40,
    image: product.image,
  }));

export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Radiant Glow Launch Edit",
    channel: "Instagram + TikTok",
    spend: 18400,
    roas: 4.8,
    conversions: 1820,
    cap: 2500,
  },
  {
    id: "c2",
    name: "Arctic Marine Hydration Push",
    channel: "Email + Search",
    spend: 9600,
    roas: 6.2,
    conversions: 780,
    cap: 1000,
  },
  {
    id: "c3",
    name: "Solar Quartz Members 2x Points",
    channel: "Lifecycle",
    spend: 4200,
    roas: 3.4,
    conversions: 612,
    cap: 800,
  },
];
// Trigger dev server cache reload
