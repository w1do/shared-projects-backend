import { Button } from "@/components/ui/inputs/button";
import { TrendingUp, Package, Sparkles, Ticket } from "lucide-react";
import { SUGGESTIONS } from "@/lib/admin/chatbot";

interface ChatSuggestionsProps {
  onSuggest: (query: string) => void;
}

export function ChatSuggestions({ onSuggest }: ChatSuggestionsProps) {
  const getIcon = (name?: string) => {
    const icons: Record<string, React.ReactNode> = {
      TrendingUp: <TrendingUp className="size-4" />,
      Package: <Package className="size-4" />,
      Ticket: <Ticket className="size-4" />,
    };
    return icons[name || ""] || <Sparkles className="size-4" />;
  };

  return (
    <div className="px-4 py-2 bg-card border-t border-border flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
      {SUGGESTIONS.map((chip) => (
        <Button
          key={chip.query}
          onClick={() => onSuggest(chip.query)}
          variant="soft"
          color="surface"
          size="xs"
          shape="circle"
          className="border border-border"
          startIcon={getIcon(chip.icon)}
        >
          {chip.label}
        </Button>
      ))}
    </div>
  );
}
