import { cn } from "@/lib/utils";

interface ChatMessageProps {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function ChatMessage({ sender, text, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-4/5",
        sender === "user" ? "ml-auto items-end" : "mr-auto items-start",
      )}
    >
      <div
        className={cn(
          "px-4 py-2 text-sm rounded-2xl wrap-break-word whitespace-pre-line shadow-sm",
          sender === "user"
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-foreground border border-border rounded-bl-none",
        )}
      >
        {text}
      </div>
      <span className="mt-2 px-1 text-micro text-muted-foreground-lighter">
        {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
