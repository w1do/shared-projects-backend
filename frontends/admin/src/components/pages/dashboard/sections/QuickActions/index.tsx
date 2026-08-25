"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Upload,
  Tag,
  Layers,
  UserPlus,
  Megaphone,
  CalendarDays,
  Download,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { ImportInventoryDialog } from "@/components/admin/ImportInventoryDialog";
import { useAdminModals } from "@/components/layout/modals";

const actions = [
  { label: "Add product", icon: Plus, href: "/admin/products/add" },
  { label: "New promotion", icon: Tag, action: "new-promotion" },
  { label: "Import inventory", icon: Upload, action: "import-inventory" },
  { label: "Create collection", icon: Layers, href: "/admin/collections/add" },
  { label: "Launch campaign", icon: Megaphone, action: "launch-campaign" },
  { label: "Invite teammate", icon: UserPlus, action: "invite-teammate" },
];

interface QuickActionsProps {
  timeRange: string;
  onTimeRangeChange: (val: string) => void;
}

export function QuickActions({ timeRange, onTimeRangeChange }: QuickActionsProps) {
  const [isStuck, setIsStuck] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { openModal } = useAdminModals();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Detect when sentinel goes above the bottom threshold of Topbar (64px height)
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      {
        rootMargin: "-64px 0px 0px 0px",
        threshold: [0],
      },
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
    };
  }, []);

  return (
    <>
      {/* Invisible sentinel for scroll detection */}
      <div ref={sentinelRef} className="hidden md:block h-0 w-full pointer-events-none" />

      <div
        className={cn(
          "hidden md:flex items-center transition-all duration-300 ease-out z-10",
          isStuck
            ? "sticky top-16 rounded-none border-x-0 border-t-0 border-b border-border bg-background/80 backdrop-blur-md px-4 py-2 -mx-4 md:-mx-24 md:px-24 shadow-sm"
            : "rounded-3xl border border-border bg-muted px-4 py-2 gap-4",
        )}
      >
        {/* Left section: Label + actions list (supports horizontal scrolling on smaller screens) */}
        <div className="flex flex-1 min-w-0 flex-nowrap items-center gap-4">
          <div className="flex shrink-0 items-center gap-2 border-r border-border pr-4 text-xs uppercase tracking-wider font-bold">
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-ring transition-all duration-300",
                isStuck ? "animate-pulse scale-110" : "",
              )}
            />
            Quick actions
          </div>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-1 min-w-0 flex-1">
            {actions.map((a) => {
              const hasHref = "href" in a && a.href;
              return (
                <Button
                  key={a.label}
                  component={hasHref ? "Link" : "button"}
                  href={hasHref ? a.href : undefined}
                  onClick={
                    !hasHref && a.action === "new-promotion"
                      ? () => openModal("promotion")
                      : !hasHref && a.action === "import-inventory"
                        ? () => setIsImportOpen(true)
                        : !hasHref && a.action === "launch-campaign"
                          ? () => openModal("campaignLaunch")
                          : !hasHref && a.action === "invite-teammate"
                            ? () => openModal("inviteMember")
                            : undefined
                  }
                  variant="contained"
                  color="surface"
                  size="sm"
                  shape="circle"
                  startIcon={<a.icon className="text-muted-foreground" />}
                >
                  {a.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Right section: Only visible when stuck, contains date filter and export buttons */}
        {isStuck && (
          <div className="flex shrink-0 items-center gap-2 border-l border-border pl-4 animate-fade-in ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="contained"
                  color="surface"
                  size="sm"
                  shape="circle"
                  startIcon={<CalendarDays className="text-muted-foreground" />}
                  endIcon={<ChevronDown className="text-muted-foreground" />}
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

            <Button
              variant="contained"
              color="primary"
              size="sm"
              shape="circle"
              startIcon={<Download />}
            >
              Export
            </Button>
          </div>
        )}
      </div>
      <ImportInventoryDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </>
  );
}
