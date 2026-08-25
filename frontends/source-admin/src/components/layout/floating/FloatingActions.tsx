"use client";

import { useState, useEffect } from "react";
import { Bot, ArrowUp, X } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { ChatbotPanel } from "./chatbot";

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChatClick = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <>
      {isChatOpen && <ChatbotPanel onClose={() => setIsChatOpen(false)} />}

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4 md:bottom-8 md:right-8">
        <IconButton
          variant="contained"
          color={isChatOpen ? "secondary" : "primary"}
          size="lg"
          onClick={handleChatClick}
          className="pointer-events-auto shadow-md"
          aria-label={isChatOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          {isChatOpen ? <X className="size-6" /> : <Bot className="size-8" />}
        </IconButton>

        {showScrollTop && (
          <IconButton
            variant="contained"
            color="secondary"
            size="lg"
            onClick={scrollToTop}
            className="pointer-events-auto shadow-md"
            aria-label="Scroll to top"
          >
            <ArrowUp className="size-6" />
          </IconButton>
        )}
      </div>
    </>
  );
}
