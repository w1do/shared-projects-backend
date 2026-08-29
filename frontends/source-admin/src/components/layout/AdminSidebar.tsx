"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/navigation/sidebar";
import * as React from "react";
import { StatusDot } from "@/components/ui/feedback/status-dot";
import { Button } from "@/components/ui/inputs/button";
import { useVisibleNavigation } from "@/lib/admin/data-source/use-visible-navigation";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { siteConfig } from "@/lib/site-config";
import { useAdminModals } from "./modals";
import { SidebarCampaignBanner } from "./components/SidebarCampaignBanner";

export function AdminSidebar() {
  const pathname = usePathname();
  const { openModal } = useAdminModals();
  const [currentUserRole, setCurrentUserRole] = React.useState<string>("");
  const { sections, quickActions } = useVisibleNavigation();
  const t = useConsoleText();

  React.useEffect(() => {
    const userStr = localStorage.getItem("current_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role || "");
      } catch (e) {
        console.error("Failed to parse user role in AdminSidebar", e);
      }
    }
  }, []);

  const filteredQuickActions = React.useMemo(() => {
    return quickActions.filter((action) => {
      if (currentUserRole === "staff") {
        return !["promotions", "campaigns", "team"].includes(action.section);
      }
      return true;
    });
  }, [currentUserRole, quickActions]);

  const filteredSections = React.useMemo(() => {
    return sections
      .map((section) => {
        return {
          ...section,
          items: section.items.filter((item) => {
            if (currentUserRole === "staff") {
              return !["settings", "team", "campaigns", "promotions"].includes(
                item.section,
              );
            }
            if (currentUserRole === "manager") {
              return !["settings"].includes(item.section);
            }
            return true;
          }),
        };
      })
      .filter((section) => section.items.length > 0);
  }, [currentUserRole, sections]);

  const isActive = (url: string) =>
    url === "/admin" ? pathname === "/admin" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-4 pt-6 pb-4 group-data-[collapsible=icon]:px-2">
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
        >
          <Image
            src={siteConfig.assets.logoSrc}
            alt={siteConfig.assets.logoAlt}
            width={32}
            height={32}
            className="size-8 shrink-0 object-contain"
            priority
          />
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-openrunde text-lg text-foreground">
              {siteConfig.brand.name}
            </span>
            <span className="truncate text-xs text-muted-foreground-lighter">
              {siteConfig.admin.shortLabel}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        {/* Mobile Quick Actions Section */}
        <SidebarGroup className="md:hidden py-2 border-b border-border/50 mb-2">
          <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wider text-brand-accent font-semibold flex items-center gap-2">
            <StatusDot color="secondary" ping />
            {t("console.nav.quick-actions")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 pt-2">
            <SidebarMenu className="grid grid-cols-2 gap-2">
              {filteredQuickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <Button
                    onClick={
                      action.action === "invite-teammate"
                        ? () => openModal("inviteMember")
                        : undefined
                    }
                    variant="soft"
                    color="primary"
                    size="md"
                    fullWidth
                    startIcon={<action.icon />}
                  >
                    {action.title}
                  </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredSections.map((section) => (
          <SidebarGroup key={section.label} className="py-2">
            <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wider text-muted-foreground-lighter font-medium">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Button
                        component="Link"
                        href={item.url}
                        variant={active ? "soft" : "ghost"}
                        color={active ? "secondary" : "primary"}
                        size="md"
                        fullWidth
                        startIcon={<item.icon />}
                        className="justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full"
                      >
                        <span className="group-data-[collapsible=icon]:sr-only">
                          {item.title}
                        </span>
                      </Button>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        {currentUserRole !== "staff" && <SidebarCampaignBanner />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
