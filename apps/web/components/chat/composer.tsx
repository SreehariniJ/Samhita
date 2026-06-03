"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FilePlus, Loader2, Paperclip, Send, Square, X } from "lucide-react";
import type { FileRecord, MessageStatus } from "@/lib/api/types";
import { formatBytes, fileIconLabel } from "@/lib/files";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { useUploadFiles } from "@/hooks/use-files";
import { useUploadStore } from "@/store/upload-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Composer({
  onSubmit,
  onStop,
  streamStatus,
  disabled
}: {
  onSubmit: (text: string, fileIds: string[]) => Promise<void> | void;
  onStop?: () => void;
  streamStatus: MessageStatus;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<FileRecord[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useAutoResizeTextarea(text);
  const uploadFiles = useUploadFiles();
  const queue = useUploadStore((state) => state.queue.slice(0, 3));
  const busy = streamStatus === "queued" || streamStatus === "streaming";

  const submit = async () => {
    if (busy || uploading || disabled) return;
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    const fileIds = attachments.map((file) => file.id);
    setText("");
    setAttachments([]);
    await onSubmit(trimmed, fileIds);
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const responses = await uploadFiles(files, "private");
      setAttachments((current) => [...current, ...responses.map((response) => response.file)]);
    } finally {
      setUploading(false);
    }
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="border-t border-border bg-background/92 px-3 py-3 backdrop-blur-xl sm:px-6">
      <div
        className={cn(
          "mx-auto max-w-3xl rounded-lg border border-border bg-card shadow-sm transition-colors",
          dragging && "border-primary bg-primary/5"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {attachments.length ? (
          <div className="flex flex-wrap gap-2 border-b border-border p-2">
            {attachments.map((file) => (
              <div key={file.id} className="flex max-w-full items-center gap-2 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs">
                <span className="rounded bg-background px-1.5 py-0.5 font-semibold">{fileIconLabel(file.content_type, file.extension)}</span>
                <span className="max-w-44 truncate">{file.original_filename}</span>
                <button aria-label={`Remove ${file.original_filename}`} onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))}>
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <Textarea
          ref={textareaRef}
          value={text}
          disabled={disabled}
          rows={1}
          placeholder="Message Samhita AI"
          className="max-h-56 min-h-14 resize-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleInput} />
            <Button type="button" variant="ghost" size="iconSm" aria-label="Attach files" onClick={() => inputRef.current?.click()} disabled={disabled || uploading}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
            </Button>
            {queue.length ? (
              <div className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
                <FilePlus className="size-3.5" />
                <span className="truncate">{queue[0].fileName}</span>
                <span>{formatBytes(queue[0].size)}</span>
                <Progress value={queue[0].progress} className="w-16" />
              </div>
            ) : null}
          </div>
          {busy ? (
            <Button type="button" variant="secondary" size="icon" aria-label="Stop generation" onClick={onStop}>
              <Square className="size-4" />
            </Button>
          ) : (
            <Button type="button" size="icon" aria-label="Send message" onClick={submit} disabled={disabled || uploading || (!text.trim() && attachments.length === 0)}>
              <Send className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
