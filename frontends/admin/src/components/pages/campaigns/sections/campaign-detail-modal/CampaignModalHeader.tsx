import React from "react";
import { DialogTitle } from "@/components/ui/overlay/dialog";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import type { Campaign } from "@/lib/admin/mocks/types";

const statusColorMap = {
  Active: "success",
  Scheduled: "warning",
  Completed: "surface",
  Draft: "surface",
} as const;

interface CampaignModalHeaderProps {
  campaign: Campaign;
}

export function CampaignModalHeader({ campaign }: CampaignModalHeaderProps) {
  const monogram = campaign.name ? campaign.name.substring(0, 2).toUpperCase() : "CA";

  return (
    <div className="relative h-48 w-full overflow-hidden bg-muted">
      <Avatar
        src={campaign.banner}
        alt={campaign.name}
        size="full"
        shape="square"
        className="w-full h-full"
        fallback={monogram}
      />
      <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/40 to-transparent" />

      <div className="absolute bottom-6 left-6 pr-6 flex items-end gap-4">
        {/* Square Thumbnail */}
        <Avatar
          src={campaign.thumbnail || campaign.banner}
          alt=""
          size="xl"
          shape="rounded"
          fallback={monogram}
          className="shrink-0 border-2 border-primary-foreground/20 shadow-md"
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              variant="contained"
              color={statusColorMap[campaign.status || "Draft"]}
              shape="circle"
              size="sm"
            >
              {campaign.status || "Draft"}
            </Badge>
            <Badge variant="contained" color="surface" shape="circle" size="sm">
              {campaign.channel}
            </Badge>
          </div>
          <DialogTitle className="font-openrunde text-heading-lg text-primary-foreground leading-tight truncate">
            {campaign.name}
          </DialogTitle>
        </div>
      </div>
    </div>
  );
}
