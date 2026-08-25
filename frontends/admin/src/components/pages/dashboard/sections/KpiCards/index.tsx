import { KpiCard } from "./KpiCard";

export type DashboardKpiItem = {
  label: string;
  value: string;
  delta: number;
  accent: boolean;
  spark: number[];
};

type KpiCardsProps = {
  items: DashboardKpiItem[];
};

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {items.map((k) => (
        <KpiCard key={k.label} item={k} />
      ))}
    </div>
  );
}
