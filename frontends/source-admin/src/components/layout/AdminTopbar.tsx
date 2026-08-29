"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/navigation/sidebar";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { TopbarUserMenu } from "./components/TopbarUserMenu";
import { ProjectDialog } from "./modals/ProjectDialog";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { useProjectCardQuery, useProjectEventsQuery } from "@/hooks/admin/project";

export function AdminTopbar() {
  const { state, toggleSidebar } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const router = useRouter();
  const t = useConsoleText();

  const { data: project } = useProjectCardQuery();
  // Журнал недоступен или права на него нет — кнопка остаётся без числа
  const { data: events } = useProjectEventsQuery();
  const [projectOpen, setProjectOpen] = useState(false);

  const projectName = project?.name?.trim() || t("console.project.title");
  const eventsCount = events?.length ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur md:px-24">
      <SidebarTrigger className="md:hidden" />
      <IconButton
        variant="ghost"
        shape="circle"
        className="hidden md:inline-flex"
        onClick={toggleSidebar}
        aria-label={
          isSidebarCollapsed
            ? t("console.topbar.expand-sidebar")
            : t("console.topbar.collapse-sidebar")
        }
        title={
          isSidebarCollapsed
            ? t("console.topbar.expand-sidebar")
            : t("console.topbar.collapse-sidebar")
        }
      >
        <SidebarToggleIcon />
      </IconButton>

      {/* Текущий проект и его активность: одна кнопка вместо индикатора сайта и создания проекта */}
      <Button
        variant="outlined"
        shape="circle"
        className="shrink-0 animate-fade-in"
        onClick={() => setProjectOpen(true)}
        data-testid="topbar-project"
      >
        {eventsCount > 0 ? `${projectName} (${eventsCount})` : projectName}
      </Button>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-2">
        <TopbarUserMenu />
      </div>

      <ProjectDialog
        open={projectOpen}
        events={events ?? []}
        onClose={() => setProjectOpen(false)}
        onSwitched={() => {
          setProjectOpen(false);
          // Разделы перечитываются под выбранный проект без перезагрузки вручную
          router.refresh();
        }}
      />
    </header>
  );
}
