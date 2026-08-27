"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { SidebarTrigger, useSidebar } from "@/components/ui/navigation/sidebar";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Avatar } from "@/components/ui/data-display/avatar";
import { NotificationsBell } from "./NotificationsBell";
import { SupportQuickMenu } from "./SupportQuickMenu";
import { StatusDot } from "@/components/ui/feedback/status-dot";
import { toast } from "sonner";
import { siteConfig } from "@/lib/site-config";
import { logoutAction } from "@/app/actions/auth";
import { useConsoleText } from "@/lib/admin/use-console-text";
import type { MockUser } from "@/lib/admin/mocks/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/overlay/dropdown-menu";

export function AdminTopbar() {
  const { state, toggleSidebar } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const [open, setOpen] = useState(false);
  const [storefrontUrl, setStorefrontUrl] = useState<string>(
    siteConfig.urls.storefrontDefault,
  );
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const router = useRouter();
  const t = useConsoleText();

  const roleLabel = (role: MockUser["role"]) =>
    role === "admin"
      ? t("console.role.admin")
      : role === "manager"
        ? t("console.role.manager")
        : t("console.role.staff");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("storefront_live_url");
      if (savedUrl) {
        setStorefrontUrl(savedUrl);
      }

      const savedUser = localStorage.getItem("current_user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
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

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-2">
        <SupportQuickMenu />
        <NotificationsBell />

        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outlined"
              shape="circle"
              size="auto"
              className="py-2 pl-4 pr-2"
            >
              <div className="hidden flex-col leading-tight text-right md:flex">
                <span className="text-xs font-medium text-foreground">
                  {currentUser?.name || "Mai Tran"}
                </span>
                <span className="text-xs text-muted-foreground-lighter">
                  {currentUser
                    ? roleLabel(currentUser.role)
                    : t("console.role.admin")}
                </span>
              </div>
              <Avatar
                size="sm"
                className="bg-primary"
                src={currentUser?.avatar}
                fallback={currentUser?.name.slice(0, 2).toUpperCase() || "MT"}
              >
                {currentUser?.name.slice(0, 2).toUpperCase() || "MT"}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-xs font-medium leading-none text-foreground">
                  {currentUser?.name || "Mai Tran"}
                </p>
                <p className="text-xs leading-none text-muted-foreground-lighter">
                  {currentUser?.email || siteConfig.urls.supportEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(currentUser?.role === "admin" || !currentUser) && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  setTimeout(() => {
                    router.push("/admin/settings");
                  }, 150);
                }}
                className="w-full flex items-center gap-2 cursor-pointer"
              >
                <Settings className="size-4" />
                <span>{t("console.nav.settings")}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setOpen(false);
                setTimeout(() => {
                  router.push("/admin/support");
                }, 150);
              }}
              className="w-full flex items-center gap-2 cursor-pointer"
            >
              <LifeBuoy className="size-4" />
              <span>{t("console.nav.support")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                setOpen(false);
                try {
                  // Server-side cookie deletion (clears HttpOnly cookie if any)
                  await logoutAction();
                  // Client-side fallback cookie deletion
                  document.cookie =
                    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  // Clear local user info
                  localStorage.removeItem("current_user");
                  toast.success(t("console.topbar.signed-out"));
                  window.location.href = "/login";
                } catch {
                  toast.error(t("console.topbar.sign-out-failed"));
                }
              }}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>{t("console.topbar.sign-out")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
