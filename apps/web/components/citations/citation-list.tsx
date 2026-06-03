"use client";

import { useQuery } from "@tanstack/react-query";
import { CitationApi } from "@/lib/api/client";
import type { Citation } from "@/lib/api/types";
import { CitationChip } from "./citation-chip";

export function CitationList({ citationIds = [], citations = [] }: { citationIds?: string[]; citations?: Citation[] }) {
  const missingIds = citationIds.filter((id) => !citations.some((citation) => citation.id === id));
  const fetched = useQuery({
    queryKey: ["citations", missingIds],
    queryFn: async () => Promise.all(missingIds.map((id) => CitationApi.get(id))),
    enabled: missingIds.length > 0
  });
  const all = [...citations, ...(fetched.data ?? [])];

  if (!all.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {all.map((citation, index) => (
        <CitationChip key={citation.id} citation={citation} index={index} />
      ))}
    </div>
  );
}
