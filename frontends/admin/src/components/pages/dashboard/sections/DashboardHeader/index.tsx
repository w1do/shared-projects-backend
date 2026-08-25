"use client";

import * as React from "react";
import { CalendarDays, Download, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";

interface DashboardHeaderProps {
  timeRange: string;
  onTimeRangeChange: (val: string) => void;
}

export function DashboardHeader({ timeRange, onTimeRangeChange }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground-lighter">
          <span className="h-2 w-2 rounded-full bg-ring" />
          <span className="uppercase tracking-widest">Overview · Apr 2026</span>
        </div>
        <h1 className="font-openrunde text-display text-foreground">Good morning, Mai</h1>
        <p className="max-w-xl text-body-lg text-muted-foreground">
          Revenue is up 12.4% week-over-week, led by WHOO and Ætheria. Three campaigns are pacing
          ahead of plan.
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
              {timeRange}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" matchTriggerWidth>
            <DropdownMenuRadioGroup value={timeRange} onValueChange={onTimeRangeChange}>
              <DropdownMenuRadioItem value="Last 7 days">Last 7 days</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Last 30 days">Last 30 days</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Last 90 days">Last 90 days</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="This year">This year</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="contained" shape="circle" startIcon={<Download />}>
          Export
        </Button>
      </div>
    </div>
  );
}
