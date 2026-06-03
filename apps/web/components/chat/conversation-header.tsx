"use client";

import { useEffect, useState } from "react";
import { Archive, MoreHorizontal, Pencil, Pin, RefreshCcw, Trash2 } from "lucide-react";
import { useDeleteConversation, useGenerateTitle, useUpdateConversation } from "@/hooks/use-conversations";
import type { Conversation } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ModelSelector } from "./model-selector";

export function ConversationHeader({
  conversation,
  modelProfile,
  onModelProfileChange
}: {
  conversation: Conversation;
  modelProfile: string;
  onModelProfileChange: (profile: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const update = useUpdateConversation(conversation.id);
  const remove = useDeleteConversation();
  const generateTitle = useGenerateTitle(conversation.id);

  useEffect(() => {
    setTitle(conversation.title);
  }, [conversation.title]);

  const saveTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== conversation.title) {
      update.mutate({ title: trimmed });
    }
    setEditing(false);
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/88 px-3 backdrop-blur-xl sm:px-5">
      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            value={title}
            autoFocus
            onChange={(event) => setTitle(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveTitle();
              if (event.key === "Escape") {
                setTitle(conversation.title);
                setEditing(false);
              }
            }}
            className="h-8 max-w-lg"
          />
        ) : (
          <button className="group flex max-w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-muted" onClick={() => setEditing(true)}>
            <span className="truncate text-sm font-semibold">{conversation.title || "Untitled chat"}</span>
            <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ModelSelector value={modelProfile} onChange={onModelProfileChange} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Conversation actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => update.mutate({ pinned: !conversation.pinned })}>
              <Pin className="size-4" />
              {conversation.pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => update.mutate({ archived: !conversation.archived })}>
              <Archive className="size-4" />
              {conversation.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => generateTitle.mutate()}>
              <RefreshCcw className="size-4" />
              Refresh title
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => remove.mutate(conversation.id)}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
