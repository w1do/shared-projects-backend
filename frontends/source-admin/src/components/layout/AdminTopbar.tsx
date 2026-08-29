"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/navigation/sidebar";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { NotificationsBell } from "./NotificationsBell";
import { TopbarUserMenu } from "./components/TopbarUserMenu";
import { SupportQuickMenu } from "./SupportQuickMenu";
import { StatusDot } from "@/components/ui/feedback/status-dot";
import { siteConfig } from "@/lib/site-config";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { useConsoleAccessQuery } from "@/hooks/admin/project";
import { CreateProjectDialog } from "./modals/CreateProjectDialog";

export function AdminTopbar() {
  const { state, toggleSidebar } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const [storefrontUrl, setStorefrontUrl] = useState<string>(
    siteConfig.urls.storefrontDefault,
  );
  const router = useRouter();
  const t = useConsoleText();
  const { data: access } = useConsoleAccessQuery();
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("storefront_live_url");
      if (savedUrl) {
        setStorefrontUrl(savedUrl);
      }

      const handleUpdate = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail) {
          setStorefrontUrl(detail);
        }
      };

      window.addEventListener("storefront-url-updated", handleUpdate);
      return () =>
        window.removeEventListener("storefront-url-updated", handleUpdate);
    }
  }, []);

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

      {/* Align live storefront status button to the left */}
      <Button
        component="Link"
        href={storefrontUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        shape="circle"
        className="hidden md:inline-flex shrink-0 animate-fade-in"
        startIcon={<StatusDot color="success" ping />}
      >
        {t("console.topbar.storefront-live")}
      </Button>

      {/* Новый проект заводит только супер-админ платформы. */}
      {access?.isSuperAdmin && (
        <Button
          variant="outlined"
          shape="circle"
          className="shrink-0"
          startIcon={<Plus />}
          onClick={() => setCreatingProject(true)}
          data-testid="topbar-create-project"
        >
          {t("console.project.create.action")}
        </Button>
      )}

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-2">
        <SupportQuickMenu />
        <NotificationsBell />

        <TopbarUserMenu />
      </div>

      <CreateProjectDialog
        open={creatingProject}
        onClose={() => setCreatingProject(false)}
        onCreated={() => {
          setCreatingProject(false);
          // Разделы перечитываются под новый проект без перезагрузки страницы.
          router.refresh();
        }}
      />
    </header>
  );
}
