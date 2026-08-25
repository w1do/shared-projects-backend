import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface CategoryStatCardProps {
  label: string;
  value: string | number;
  description: ReactNode;
  icon: LucideIcon;
  position: 1 | 2 | 3;
  iconTone?: "neutral" | "accent";
}

export function CategoryStatCard({
  label,
  value,
  description,
  icon: Icon,
  position,
  iconTone = "neutral",
}: CategoryStatCardProps) {
  const iconWrapperToneClass =
    iconTone === "accent" ? "bg-primary/10 text-primary" : "bg-muted text-foreground";

  const iconToneClass = iconTone === "accent" ? "text-primary" : "text-muted-foreground";

  const borderClassByPosition = {
    1: "border-b border-border/60 sm:border-r lg:border-b-0",
    2: "border-b border-border/60 lg:border-r lg:border-b-0",
    3: "border-b border-border/60 sm:border-r lg:border-b-0",
  };

  return (
    <div className={`flex items-start justify-between p-6 ${borderClassByPosition[position]}`}>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className="font-openrunde text-heading-lg text-foreground truncate max-w-40"
          title={String(value)}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground-lighter">{description}</span>
      </div>
      <div
        className={`flex size-16 shrink-0 items-center justify-center rounded-xl ${iconWrapperToneClass}`}
      >
        <Icon className={`size-8 ${iconToneClass}`} />
      </div>
    </div>
  );
}
