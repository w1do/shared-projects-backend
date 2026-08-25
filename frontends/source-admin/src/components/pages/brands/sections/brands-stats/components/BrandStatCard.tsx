import type { LucideIcon } from "lucide-react";

interface BrandStatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  position: "first" | "middle" | "last";
  iconTone?: "neutral" | "accent";
  valueTone?: "default" | "danger";
}

export function BrandStatCard({
  label,
  value,
  description,
  icon: Icon,
  position,
  iconTone = "neutral",
  valueTone = "default",
}: BrandStatCardProps) {
  const iconToneClass =
    iconTone === "accent" ? "bg-accent text-foreground" : "bg-muted text-foreground";
  const valueToneClass = valueTone === "danger" ? "text-brand-accent" : "text-foreground";
  const borderClassByPosition = {
    first: "border-b border-r border-border/60 sm:border-b-0 lg:border-b-0",
    middle: "border-b border-r border-border/60 sm:border-b-0 lg:border-b-0",
    last: "border-b border-r border-border/60 lg:border-b-0",
  };

  return (
    <div className={`flex items-start justify-between p-6 ${borderClassByPosition[position]}`}>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`truncate font-openrunde text-heading-lg ${valueToneClass} max-w-40`}>
          {value}
        </span>
        <span className="text-xs text-muted-foreground-lighter">{description}</span>
      </div>
      <div
        className={`flex size-16 shrink-0 items-center justify-center rounded-xl ${iconToneClass}`}
      >
        <Icon className="size-8" />
      </div>
    </div>
  );
}
