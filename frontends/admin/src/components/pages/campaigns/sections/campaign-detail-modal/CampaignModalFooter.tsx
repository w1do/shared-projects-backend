import React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";

interface CampaignModalFooterProps {
  campaignId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function CampaignModalFooter({ campaignId, onClose, onDelete }: CampaignModalFooterProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        variant="ghost"
        color="error"
        shape="circle"
        startIcon={<Trash2 />}
        onClick={() => onDelete(campaignId)}
      >
        Delete Campaign
      </Button>
      <div className="flex items-center gap-2">
        <Button variant="outlined" shape="circle" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          shape="circle"
          startIcon={<Edit3 />}
          onClick={() => {
            router.push(`/admin/campaigns/${campaignId}/edit`);
            onClose();
          }}
        >
          Edit Campaign
        </Button>
      </div>
    </div>
  );
}
