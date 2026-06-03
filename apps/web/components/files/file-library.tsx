"use client";

import Link from "next/link";
import { FileText, Plus, RefreshCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useFiles } from "@/hooks/use-files";
import { formatDateTime } from "@/lib/dates";
import { fileIconLabel, formatBytes } from "@/lib/files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorPanel } from "@/components/states/error-panel";
import { RouteFrame } from "@/components/states/route-frame";
import { IngestionStatus } from "./ingestion-status";

export function FileLibrary() {
  const files = useFiles();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const items = files.data?.items ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((file) => file.original_filename.toLowerCase().includes(needle) || file.content_type.toLowerCase().includes(needle));
  }, [files.data?.items, query]);

  return (
    <RouteFrame
      title="Files"
      description="Documents available to local retrieval"
      actions={
        <Button asChild>
          <Link href="/files/upload">
            <Plus className="size-4" />
            Upload
          </Link>
        </Button>
      }
    >
      <div className="relative max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search files" />
      </div>
      {files.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : files.error ? (
        <ErrorPanel title="Files unavailable" description={files.error instanceof Error ? files.error.message : undefined} action={<Button variant="outline" onClick={() => files.refetch()}><RefreshCcw className="size-4" />Retry</Button>} />
      ) : filtered.length ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto] border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_130px_160px_160px]">
            <span>Name</span>
            <span className="hidden sm:block">Size</span>
            <span className="hidden sm:block">Status</span>
            <span>Created</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((file) => (
              <Link key={file.id} href={`/files/${file.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 hover:bg-muted/45 sm:grid-cols-[1fr_130px_160px_160px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">{fileIconLabel(file.content_type, file.extension)}</span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{file.original_filename}</div>
                    <div className="truncate text-xs text-muted-foreground">{file.content_type}</div>
                  </div>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">{formatBytes(file.size_bytes)}</span>
                <span className="hidden sm:block"><IngestionStatus file={file} /></span>
                <span className="text-xs text-muted-foreground">{formatDateTime(file.created_at)}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState icon={FileText} title="No files" action={<Button asChild><Link href="/files/upload">Upload</Link></Button>} />
      )}
    </RouteFrame>
  );
}
