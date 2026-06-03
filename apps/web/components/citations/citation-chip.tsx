"use client";

import { FileText } from "lucide-react";
import type { Citation } from "@/lib/api/types";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";

export function CitationChip({ citation, index }: { citation: Citation; index: number }) {
  const openCitation = useAppStore((state) => state.openCitation);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 gap-1.5 rounded-md px-2 text-xs"
      onClick={() => openCitation(citation)}
      aria-label={`Open citation ${index + 1}`}
    >
      <FileText className="size-3.5" />
      <span>{index + 1}</span>
      <span className="max-w-32 truncate text-muted-foreground">{citation.source_title}</span>
    </Button>
  );
}
