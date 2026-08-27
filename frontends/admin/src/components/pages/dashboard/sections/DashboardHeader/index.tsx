"use client";

import * as React from "react";
import { CalendarDays, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { t, tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { getCurrentUser } from "@/lib/admin/data-source/session";
import { DASHBOARD_TIME_RANGES, timeRangeLabel } from "../../utils/time-range";

interface DashboardHeaderProps {
  timeRange: string;
  onTimeRangeChange: (val: string) => void;
}

export function DashboardHeader({
  timeRange,
  onTimeRangeChange,
}: DashboardHeaderProps) {
  useConsoleText();
  const [operatorName, setOperatorName] = React.useState<string>("");

  React.useEffect(() => {
    setOperatorName(getCurrentUser()?.name ?? "");
  }, []);

  const greeting = operatorName
    ? tf("console.dashboard.greeting", { name: operatorName })
    : t("console.dashboard.greeting-generic");

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground-lighter">
          <span className="h-2 w-2 rounded-full bg-ring" />
          <span className="uppercase tracking-widest">
            {t("console.dashboard.eyebrow")}
          </span>
        </div>
        <h1 className="font-openrunde text-display text-foreground">
          {greeting}
        </h1>
        <p className="max-w-xl text-body-lg text-muted-foreground">
          {t("console.dashboard.subtitle")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outlined"
              shape="circle"
              startIcon={<CalendarDays />}
              endIcon={<ChevronDown />}
            >
              {timeRangeLabel(timeRange)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" matchTriggerWidth>
            <DropdownMenuRadioGroup
              value={timeRange}
              onValueChange={onTimeRangeChange}
            >
              {DASHBOARD_TIME_RANGES.map((range) => (
                <DropdownMenuRadioItem key={range} value={range}>
                  {timeRangeLabel(range)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="contained" shape="circle" startIcon={<Download />}>
          {t("console.dashboard.export")}
        </Button>
      </div>
    </div>
  );
}
