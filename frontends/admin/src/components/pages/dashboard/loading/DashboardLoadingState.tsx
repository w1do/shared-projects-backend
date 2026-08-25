import { DashboardHeaderSkeleton } from "./header/DashboardHeaderSkeleton";
import { QuickActionsSkeleton } from "./header/QuickActionsSkeleton";
import { BrandPerformanceSkeleton } from "./metrics/BrandPerformanceSkeleton";
import { KpiCardsSkeleton } from "./metrics/KpiCardsSkeleton";
import { RevenueChartSkeleton } from "./metrics/RevenueChartSkeleton";
import { BestSellersSkeleton } from "./widgets/BestSellersSkeleton";
import { CampaignPerformanceSkeleton } from "./widgets/CampaignPerformanceSkeleton";
import { CategorySalesSkeleton } from "./widgets/CategorySalesSkeleton";
import { LowStockSkeleton } from "./widgets/LowStockSkeleton";
import { RecentOrdersSkeleton } from "./widgets/RecentOrdersSkeleton";

/**
 * Full-page dashboard skeleton that mirrors AdminDashboardClient layout nesting.
 * Shown while useDashboardQuery is pending (mock delay or real API latency).
 */
export function DashboardLoadingState() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <DashboardHeaderSkeleton />
      <QuickActionsSkeleton />
      <KpiCardsSkeleton />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChartSkeleton />
        </div>
        <CampaignPerformanceSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersSkeleton />
        </div>
        <LowStockSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BestSellersSkeleton />
        <CategorySalesSkeleton />
      </div>

      <BrandPerformanceSkeleton />
    </div>
  );
}
