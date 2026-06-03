import type { FileRecord, IngestionJob } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function IngestionStatus({ file, job }: { file?: FileRecord; job?: IngestionJob }) {
  const status = job?.status ?? file?.ingestion_status ?? "queued";
  const variant = status === "succeeded" || status === "ready" ? "success" : status === "failed" ? "danger" : status === "running" || status === "queued" ? "warning" : "secondary";
  const progress = job?.progress.total ? Math.round((job.progress.current / job.progress.total) * 100) : status === "succeeded" || status === "ready" ? 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>{status}</Badge>
      {job && ["queued", "running"].includes(job.status) ? <Progress value={progress} className="w-24" /> : null}
    </div>
  );
}
