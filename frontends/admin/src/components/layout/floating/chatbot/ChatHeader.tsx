import { Bot, X } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { StatusDot } from "@/components/ui/feedback/status-dot";

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center shadow-sm">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-medium text-foreground flex items-center gap-2 leading-none">
            Aetheria Advisor
            <StatusDot color="success" size="md" ping />
          </div>
          <span className="mt-2 block text-micro leading-none text-muted-foreground">
            Workspace AI Assistant
          </span>
        </div>
      </div>
      <IconButton
        variant="ghost"
        color="surface"
        size="sm"
        onClick={onClose}
        aria-label="Close Chat"
      >
        <X />
      </IconButton>
    </div>
  );
}
