"use client";

import { Inbox, Timer, CheckCircle2, Smile } from "lucide-react";
import { KpiStatCard, type KpiStat } from "@/components/shared";
import type { SupportTicket } from "@/lib/admin/mocks/support";

interface SupportStatsProps {
  tickets: SupportTicket[];
}

export function SupportStats({ tickets }: SupportStatsProps) {
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const closedish = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
  const resolutionRate = tickets.length > 0 ? (closedish / tickets.length) * 100 : 0;

  const kpis: KpiStat[] = [
    {
      label: "Open Tickets",
      value: `${openCount}`,
      delta: `${tickets.length} in inbox`,
      icon: Inbox,
      trend: [8, 6, 7, 5, 6, 4, 5, 3, 4, 3],
    },
    {
      label: "Avg. First Response",
      value: "1h 42m",
      delta: "-12% this week",
      icon: Timer,
      trend: [40, 36, 38, 32, 30, 28, 26, 24, 22, 20],
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate.toFixed(0)}%`,
      delta: "+5.4% vs last month",
      icon: CheckCircle2,
      trend: [60, 64, 62, 70, 68, 75, 72, 80, 82, 86],
    },
    {
      label: "CSAT Score",
      value: "94%",
      delta: "Customer satisfaction",
      icon: Smile,
      trend: [70, 74, 73, 78, 80, 84, 86, 90, 92, 94],
      accent: true,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiStatCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
