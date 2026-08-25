"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getBotReply } from "@/lib/admin/chatbot";
import { ChatMessage } from "./ChatMessage";
import { ChatSuggestions } from "./ChatSuggestions";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function ChatbotPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your Aetheria Workspace Companion. How can I help you manage your store analytics, orders, or support tickets today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((p) => [
      ...p,
      { id: Math.random().toString(36).substring(7), sender: "user", text, timestamp: new Date() },
    ]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [
        ...p,
        {
          id: Math.random().toString(36).substring(7),
          sender: "bot",
          text: getBotReply(text),
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  return (
    <div
      className={cn(
        "fixed z-50",
        "bottom-24 right-6 md:bottom-8 md:right-24 w-124",
        "h-160 rounded-3xl bg-card border border-border shadow-subtle-3",
        "flex flex-col overflow-hidden pointer-events-auto",
        "animate-in fade-in slide-in-from-bottom-8 duration-300 ease-out",
      )}
    >
      {/* Header */}
      <ChatHeader onClose={onClose} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} timestamp={msg.timestamp} />
        ))}

        {isTyping && (
          <div className="flex flex-col items-start max-w-4/5">
            <div className="px-4 py-4 bg-card border border-border rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <ChatSuggestions onSuggest={handleSendMessage} />

      {/* Input Form */}
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
