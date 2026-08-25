"use client";

import { Sparkles, Trophy, TrendingUp } from "lucide-react";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import { BrandMarketShareCard } from "./components/BrandMarketShareCard";
import { BrandStatCard } from "./components/BrandStatCard";
import { formatCurrency } from "@/lib/utils";
import { getBrandMarketShareSegments, getBrandsSummary } from "@/lib/admin/brands/stats";
import type { Brand } from "@/lib/admin/mocks/types";

interface BrandsStatsProps {
  brands: Brand[];
}

export function BrandsStats({ brands }: BrandsStatsProps) {
  const summary = getBrandsSummary(brands);
  const marketShareSegments = getBrandMarketShareSegments(brands);
  const progress = marketShareSegments.map((segment) => ({
    id: segment.id,
    value: segment.normalizedShare,
  }));
  const leaderDescription = summary.leader
    ? `${formatCurrency(summary.leader.revenue)} (${summary.leader.share}% share)`
    : "No active labels yet";
  const growthValue = `${summary.weightedAverageGrowth >= 0 ? "+" : ""}${summary.weightedAverageGrowth.toFixed(1)}%`;

  return (
    <>
      <AdminDynamicStyles progress={progress} />
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-background shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
        <BrandStatCard
          label="Total Brands"
          value={summary.totalBrands}
          description="Active labels in portfolio"
          icon={Sparkles}
          position="first"
        />
        <BrandStatCard
          label="Top Performer"
          value={summary.leader?.name ?? "N/A"}
          description={leaderDescription}
          icon={Trophy}
          position="middle"
          iconTone="accent"
        />
        <BrandStatCard
          label="Average Growth"
          value={growthValue}
          description="Weighted average growth YoY"
          icon={TrendingUp}
          position="last"
          valueTone={summary.weightedAverageGrowth < 0 ? "danger" : "default"}
        />
        <BrandMarketShareCard segments={marketShareSegments} />
      </div>
    </>
  );
}
