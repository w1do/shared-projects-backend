import type { Brand } from "@/lib/admin/mocks/types";

export type BrandMarketShareSegment = {
  id: string;
  name: string;
  share: number;
  normalizedShare: number;
  toneClassName: string;
};

export function getBrandsSummary(brands: Brand[]) {
  const totalBrands = brands.length;
  const leader = brands.reduce<Brand | null>(
    (currentLeader, brand) =>
      !currentLeader || brand.revenue > currentLeader.revenue ? brand : currentLeader,
    null,
  );
  const totalRevenue = brands.reduce((sum, brand) => sum + brand.revenue, 0);
  const weightedAverageGrowth =
    totalRevenue > 0
      ? brands.reduce((sum, brand) => sum + brand.delta * brand.revenue, 0) / totalRevenue
      : 0;

  return {
    totalBrands,
    leader,
    weightedAverageGrowth,
  };
}

export function getBrandMarketShareSegments(brands: Brand[]): BrandMarketShareSegment[] {
  const totalShare = brands.reduce((sum, brand) => sum + Math.max(0, brand.share), 0);
  const sorted = [...brands].sort((a, b) => Math.max(0, b.share) - Math.max(0, a.share));
  const topTones = ["bg-brand-accent", "bg-info"];

  // Show the two leading brands, then roll everything else into "Others".
  const segments: BrandMarketShareSegment[] = sorted.slice(0, 2).map((brand, index) => {
    const share = Math.max(0, brand.share);

    return {
      id: `brand-market-share-${brand.id}`,
      name: brand.name,
      share: brand.share,
      normalizedShare: totalShare > 0 ? (share / totalShare) * 100 : 0,
      toneClassName: topTones[index],
    };
  });

  if (sorted.length > 2) {
    const restShare = sorted.slice(2).reduce((sum, brand) => sum + Math.max(0, brand.share), 0);

    segments.push({
      id: "brand-market-share-others",
      name: "Others",
      share: Number(restShare.toFixed(1)),
      normalizedShare: totalShare > 0 ? (restShare / totalShare) * 100 : 0,
      toneClassName: "bg-muted-foreground-lighter",
    });
  }

  return segments;
}
