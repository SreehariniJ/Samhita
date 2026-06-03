"use client";

import Link from "next/link";
import { ArrowLeft, Download, RefreshCcw, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FilesApi, IngestionApi } from "@/lib/api/client";
import { downloadBlob } from "@/lib/download";
import { formatBytes } from "@/lib/files";
import { useFile, useFilePreview, useRemoveFile } from "@/hooks/use-files";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorPanel } from "@/components/states/error-panel";
import { RouteFrame } from "@/components/states/route-frame";
import { IngestionStatus } from "./ingestion-status";

export function FilePreviewPage({ fileId }: { fileId: string }) {
  const file = useFile(fileId);
  const preview = useFilePreview(fileId);
  const remove = useRemoveFile();
  const queryClient = useQueryClient();
  const retry = useMutation({
    mutationFn: () => IngestionApi.create(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file", fileId] });
      toast.success("Ingestion queued");
    },
    onError: () => toast.error("Ingestion could not be queued")
  });

  const download = async () => {
    if (!file.data) return;
    const blob = await FilesApi.download(fileId);
    downloadBlob(blob, file.data.original_filename);
  };

  return (
    <RouteFrame
      title={file.data?.original_filename ?? "File"}
      description={file.data ? `${file.data.content_type} - ${formatBytes(file.data.size_bytes)}` : undefined}
      actions={
        <>
          <Button asChild variant="outline" size="sm">
            <Link href="/files">
              <ArrowLeft className="size-4" />
              Files
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={download} disabled={!file.data}>
            <Download className="size-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => retry.mutate()} disabled={retry.isPending}>
            <RefreshCcw className="size-4" />
            Retry ingestion
          </Button>
          <Button variant="destructive" size="sm" onClick={() => remove.mutate(fileId)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </>
      }
    >
      {file.isLoading ? (
        <Skeleton className="h-24" />
      ) : file.error ? (
        <ErrorPanel title="File unavailable" description={file.error instanceof Error ? file.error.message : undefined} />
      ) : file.data ? (
        <div className="flex flex-wrap items-center gap-2">
          <IngestionStatus file={file.data} />
          {file.data.document_id ? <Badge variant="outline">{file.data.document_id}</Badge> : null}
          <Badge variant="secondary">{file.data.sha256.slice(0, 12)}</Badge>
        </div>
      ) : null}

      {preview.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-80" />
        </div>
      ) : preview.error ? (
        <ErrorPanel title="Preview unavailable" description={preview.error instanceof Error ? preview.error.message : undefined} />
      ) : preview.data ? (
        <div className="space-y-4">
          {preview.data.pages.map((page) => (
            <section key={page.page_number} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 text-xs font-semibold text-muted-foreground">Page {page.page_number}</div>
              <MarkdownRenderer content={page.markdown} />
            </section>
          ))}
        </div>
      ) : null}
    </RouteFrame>
  );
}
