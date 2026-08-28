"use client";

import { Users, UserCheck, UserX, Activity } from "lucide-react";
import { KpiStatCard } from "@/components/shared";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CustomersStatsProps {
  customers: DetailedCustomer[];
}

/**
 * Честные показатели раздела: только реальные поля пользователей проекта
 * (статус активен/заблокирован). Денежных и лояльностных метрик у платформы
 * нет — карточек CLV и VIP здесь нет, как и зашитых дельт и трендов.
 */
export function CustomersStats({ customers }: CustomersStatsProps) {
  const t = useConsoleText();
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === "Active").length;
  const blockedCount = totalCount - activeCount;
  const activeRate = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

  const kpis = [
    {
      label: t("console.customers.stats.total"),
      value: totalCount.toString(),
      icon: Users,
    },
    {
      label: t("console.customers.stats.active"),
      value: activeCount.toString(),
      icon: UserCheck,
    },
    {
      label: t("console.customers.stats.blocked"),
      value: blockedCount.toString(),
      icon: UserX,
    },
    {
      label: t("console.customers.stats.active-rate"),
      value: `${activeRate.toFixed(1)}%`,
      icon: Activity,
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
