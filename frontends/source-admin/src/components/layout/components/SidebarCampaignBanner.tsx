"use client";

import * as React from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/navigation/sidebar";
import { siteConfig } from "@/lib/site-config";

export function SidebarCampaignBanner() {
  return (
    <>
      <div className="rounded-3xl bg-accent p-4 group-data-[collapsible=icon]:hidden">
        <p className="font-openrunde text-heading leading-tight text-accent-foreground">
          Boost spring launch
        </p>
        <p className="mt-2 text-body text-muted-foreground">{siteConfig.copy.membersPromo}</p>
        <Button
          component="Link"
          href="/admin/campaigns/add"
          size="sm"
          shape="circle"
          className="mt-4"
        >
          Plan campaign
        </Button>
      </div>
      <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
        <SidebarMenuItem className="flex justify-center">
          <SidebarMenuButton
            asChild
            className="size-8 rounded-full p-0 text-brand-accent bg-accent hover:bg-accent/70 flex items-center justify-center"
            tooltip="Plan campaign"
          >
            <Link href="/admin/campaigns/add">
              <Megaphone size={16} />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
