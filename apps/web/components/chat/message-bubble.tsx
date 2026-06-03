"use client";

import { Check, Copy, RefreshCcw, Square, User } from "lucide-react";
import { toast } from "sonner";
import type { LocalMessage } from "@/store/chat-store";
import { messageText } from "@/lib/messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CitationList } from "@/components/citations/citation-list";
import { MarkdownRenderer } from "./markdown-renderer";

export function MessageBubble({
  message,
  onRetry,
  onStop,
  canStop
}: {
  message: LocalMessage;
  onRetry?: (message: LocalMessage) => void;
  onStop?: () => void;
  canStop?: boolean;
}) {
  const text = messageText(message);
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";

  return (
    <article className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={isUser ? "max-w-[86%] sm:max-w-[72%]" : "w-full max-w-3xl"}>
        <div className={isUser ? "rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm" : "rounded-lg bg-transparent px-0 py-2"}>
          {isAssistant ? (
            <div className="flex gap-3">
              <div className="mt-1 hidden size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold sm:flex">AI</div>
              <div className="min-w-0 flex-1">
                {message.status === "queued" && !text ? <StreamingDots label="Queued" /> : null}
                {text ? <MarkdownRenderer content={text} /> : null}
                {message.status === "streaming" ? <StreamingDots label="Streaming" /> : null}
                {message.status === "failed" ? <Badge variant="danger">Failed</Badge> : null}
                {message.status === "interrupted" ? <Badge variant="warning">Interrupted</Badge> : null}
                <CitationList citationIds={message.citation_ids} citations={message.citations} />
                <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label="Copy response"
                    onClick={() => {
                      navigator.clipboard.writeText(text);
                      toast.success("Response copied");
                    }}
                    disabled={!text}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  {onRetry ? (
                    <Button variant="ghost" size="iconSm" aria-label="Retry generation" onClick={() => onRetry(message)}>
                      <RefreshCcw className="size-3.5" />
                    </Button>
                  ) : null}
                  {canStop && onStop ? (
                    <Button variant="ghost" size="iconSm" aria-label="Stop generation" onClick={onStop}>
                      <Square className="size-3.5" />
                    </Button>
                  ) : null}
                  {message.status === "complete" ? <Check className="ml-1 size-3.5 text-emerald-500" /> : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <User className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6">{text}</div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function StreamingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <span>{label}</span>
      <span className="flex gap-1">
        <span className="size-1.5 animate-pulse-soft rounded-full bg-primary" />
        <span className="size-1.5 animate-pulse-soft rounded-full bg-primary [animation-delay:120ms]" />
        <span className="size-1.5 animate-pulse-soft rounded-full bg-primary [animation-delay:240ms]" />
      </span>
    </div>
  );
}
