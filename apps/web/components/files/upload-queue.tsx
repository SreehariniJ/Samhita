"use client";

import { CheckCircle2, RefreshCcw, XCircle } from "lucide-react";
import { useIngestionJob, useRetryIngestion } from "@/hooks/use-files";
import { formatBytes } from "@/lib/files";
import type { UploadQueueItem } from "@/store/upload-store";
import { useUploadStore } from "@/store/upload-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IngestionStatus } from "./ingestion-status";

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
          <UploadQueueRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function UploadQueueRow({ item }: { item: UploadQueueItem }) {
  const liveJob = useIngestionJob(item.job?.id);
  const retry = useRetryIngestion();
  const job = liveJob.data ?? item.job;
  const jobProgress = job?.progress.total ? Math.round((job.progress.current / job.progress.total) * 100) : undefined;
  const displayProgress = item.status === "uploading" ? item.progress : jobProgress ?? item.progress;
  const failed = item.status === "failed" || job?.status === "failed";
  const ready = item.status === "ready" || job?.status === "succeeded";

  return (
    <div className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{item.fileName}</span>
          <span className="text-xs text-muted-foreground">{formatBytes(item.size)}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={displayProgress} className="max-w-xs" />
          <span className="w-10 text-right text-xs text-muted-foreground">{displayProgress}%</span>
        </div>
        {item.error ? <p className="mt-1 text-xs text-destructive">{item.error}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
        {failed ? <XCircle className="size-4 text-destructive" /> : ready ? <CheckCircle2 className="size-4 text-emerald-500" /> : null}
        {job ? <IngestionStatus job={job} /> : <span>{item.status}</span>}
        {job?.status === "failed" ? (
          <Button size="sm" variant="outline" onClick={() => retry.mutate(job.id)} disabled={retry.isPending}>
            <RefreshCcw className="size-4" />
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
