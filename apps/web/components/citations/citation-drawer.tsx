"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, LocateFixed, X } from "lucide-react";
import Link from "next/link";
import { CitationApi } from "@/lib/api/client";
import { useAppStore } from "@/store/app-store";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

export function CitationDrawer() {
  const open = useAppStore((state) => state.citationDrawerOpen);
  const citation = useAppStore((state) => state.activeCitation);
  const closeCitation = useAppStore((state) => state.closeCitation);
  const source = useQuery({
    queryKey: ["citation-source", citation?.id],
    queryFn: () => CitationApi.source(citation?.id as string),
    enabled: Boolean(open && citation?.id)
  });

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? closeCitation() : undefined)}>
      <SheetContent side="right" className="flex w-full max-w-lg flex-col gap-0 p-0 sm:w-[480px]">
        <SheetHeader className="border-b border-border p-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <SheetTitle className="truncate text-base">{citation?.source_title ?? "Citation"}</SheetTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {citation ? <Badge variant="secondary">Page {citation.page_start}{citation.page_end && citation.page_end !== citation.page_start ? `-${citation.page_end}` : ""}</Badge> : null}
                {citation?.section ? <Badge variant="outline">{citation.section}</Badge> : null}
                {citation ? <Badge variant="success">{Math.round(citation.confidence * 100)}%</Badge> : null}
              </div>
            </div>
            <Button variant="ghost" size="iconSm" onClick={closeCitation} aria-label="Close citation">
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          {citation ? (
            <div className="space-y-4">
              <section className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <FileText className="size-3.5" />
                  Chunk {citation.chunk_id}
                </div>
                <p className="text-sm leading-6">{citation.snippet}</p>
              </section>
              {citation.bbox ? (
                <section className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <LocateFixed className="size-4" />
                    Page reference
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    x{citation.bbox.x0.toFixed(0)}, y{citation.bbox.y0.toFixed(0)} to x{citation.bbox.x1.toFixed(0)}, y{citation.bbox.y1.toFixed(0)}
                  </p>
                </section>
              ) : null}
              {citation.file_id ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/files/${citation.file_id}`}>
                    <ExternalLink className="size-4" />
                    Open source
                  </Link>
                </Button>
              ) : null}
              <section>
                <h3 className="mb-2 text-sm font-semibold">Preview</h3>
                {source.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : source.data ? (
                  <div className="rounded-lg border border-border bg-background p-3">
                    <MarkdownRenderer content={source.data.preview_markdown} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Source preview unavailable</p>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
