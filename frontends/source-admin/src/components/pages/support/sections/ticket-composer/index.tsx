"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Textarea } from "@/components/ui/inputs/textarea";

interface TicketComposerProps {
  onSend: (body: string) => void;
}

export function TicketComposer({ onSend }: TicketComposerProps) {
  const [body, setBody] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight + 4}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [body]);

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setBody("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex gap-4 items-end border-t border-border/60 p-4">
      <Textarea
        ref={textareaRef}
        placeholder="Write a reply…  (⌘ + Enter to send)"
        rows={1}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-10 h-10 py-2 resize-none overflow-y-auto max-h-60"
      />
      <Button
        type="button"
        variant="contained"
        shape="circle"
        size="md"
        endIcon={<SendHorizontal />}
        onClick={submit}
        disabled={!body.trim()}
        className="text-xs font-semibold shrink-0"
      >
        Send reply
      </Button>
    </div>
  );
}
