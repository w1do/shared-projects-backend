import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { IconButton } from "@/components/ui/inputs/icon-button";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSend(inputValue);
    setInputValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-border bg-card flex gap-2 items-center"
    >
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ask Aetheria Advisor..."
        variant="soft"
        color="secondary"
        size="md"
        shape="circle"
        className="flex-1"
      />
      <IconButton
        type="submit"
        disabled={!inputValue.trim()}
        variant="contained"
        color="primary"
        aria-label="Send message"
      >
        <Send />
      </IconButton>
    </form>
  );
}
