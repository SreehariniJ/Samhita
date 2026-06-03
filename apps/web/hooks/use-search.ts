"use client";

import { useMutation } from "@tanstack/react-query";
import { SearchApi } from "@/lib/api/client";
import type { SearchRequest } from "@/lib/api/types";

export function useHybridSearch() {
  return useMutation({
    mutationFn: (request: SearchRequest) => SearchApi.search(request)
  });
}
