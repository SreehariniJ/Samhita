"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { formatBytes } from "@/lib/files";
import { useUploadStore } from "@/store/upload-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function UploadQueue() {
  const queue = useUploadStore((state) => state.queue);
  const clearCompleted = useUploadStore((state) => state.clearCompleted);

  if (!queue.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Uploads</h2>
        <Button size="sm" variant="ghost" onClick={clearCompleted}>
          Clear
        </Button>
      </div>
      <div className="divide-y divide-border">
        {queue.map((item) => (
          <div key={item.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{item.fileName}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(item.size)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={item.progress} className="max-w-xs" />
                <span className="w-10 text-right text-xs text-muted-foreground">{item.progress}%</span>
              </div>
              {item.error ? <p className="mt-1 text-xs text-destructive">{item.error}</p> : null}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.status === "failed" ? <XCircle className="size-4 text-destructive" /> : item.status === "ready" ? <CheckCircle2 className="size-4 text-emerald-500" /> : null}
              <span>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
