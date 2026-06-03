"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { Message } from "@/lib/api/types";
import type { LocalMessage } from "@/store/chat-store";
import { EmptyState } from "@/components/states/empty-state";
import { MessageBubble } from "./message-bubble";

export function MessageList({
  messages,
  onRetry,
  onStop,
  streamStatus
}: {
  messages: LocalMessage[];
  onRetry: (message: LocalMessage) => void;
  onStop: () => void;
  streamStatus: Message["status"];
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const canStop = streamStatus === "queued" || streamStatus === "streaming";
  const merged = useMemo(() => messages.filter((message) => message.role !== "system"), [messages]);
  const lastMessageContent = merged[merged.length - 1]?.content;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastMessageContent, merged.length]);

  if (!merged.length) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState icon={MessageCircle} title="New conversation" />
      </div>
    );
  }

  return (
    <div className="chat-scrollbar h-full overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <AnimatePresence initial={false}>
          {merged.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <MessageBubble message={message} onRetry={message.role === "assistant" ? onRetry : undefined} onStop={onStop} canStop={canStop && message.status === "streaming"} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
