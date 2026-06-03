"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, FileSearch, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { useHybridSearch } from "@/hooks/use-search";
import type { ContentType, DocumentType, SearchFilters, SearchResult } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorPanel } from "@/components/states/error-panel";
import { RouteFrame } from "@/components/states/route-frame";

const documentTypes: DocumentType[] = ["pdf", "image", "docx", "pptx", "xlsx"];
const contentTypes: ContentType[] = ["text", "table", "figure", "image", "chart", "diagram"];

export function SearchPage() {
  const search = useHybridSearch();
  const [query, setQuery] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | "all">("all");
  const [contentType, setContentType] = useState<ContentType | "all">("all");
  const [limit, setLimit] = useState("12");

  const filters = useMemo<SearchFilters>(() => {
    const next: SearchFilters = {};
    if (documentType !== "all") next.document_types = [documentType];
    if (contentType !== "all") next.content_types = [contentType];
    return next;
  }, [contentType, documentType]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    search.mutate({
      query: trimmed,
      filters,
      limit: Number(limit)
    });
  };

  const results = search.data?.results ?? [];

  return (
    <RouteFrame title="Search" description="Hybrid retrieval across workspace documents" className="max-w-7xl">
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-3 shadow-sm lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 pl-9"
            placeholder="Search documents, tables, figures, and prior knowledge"
            aria-label="Search documents"
          />
        </label>
        <Button className="h-11" disabled={search.isPending || query.trim().length === 0}>
          {search.isPending ? <Loader2 className="size-4 animate-spin" /> : <FileSearch className="size-4" />}
          Search
        </Button>
        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-3 lg:col-span-2">
          <FilterSelect
            label="Document"
            value={documentType}
            onChange={(value) => setDocumentType(value as DocumentType | "all")}
            options={documentTypes}
          />
          <FilterSelect
            label="Content"
            value={contentType}
            onChange={(value) => setContentType(value as ContentType | "all")}
            options={contentTypes}
          />
          <div className="space-y-2">
            <Label htmlFor="limit">Results</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger id="limit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>

      {search.error ? (
        <ErrorPanel
          title="Search failed"
          description={search.error instanceof Error ? search.error.message : undefined}
          action={
            <Button variant="outline" onClick={() => query.trim() && search.mutate({ query: query.trim(), filters, limit: Number(limit) })}>
              Retry
            </Button>
          }
        />
      ) : null}

      {search.isPending ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="min-h-44 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : search.data && results.length === 0 ? (
        <EmptyState icon={FileSearch} title="No matching sources" description="Try a broader query or remove filters." />
      ) : results.length ? (
        <section className="grid gap-3 md:grid-cols-2">
          {results.map((result, index) => (
            <SearchResultCard key={result.chunk_id} result={result} index={index} />
          ))}
        </section>
      ) : (
        <EmptyState icon={SlidersHorizontal} title="Search your workspace" description="Use filters when you need to narrow retrieval to specific document or content types." />
      )}
    </RouteFrame>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">
              {index + 1}. {result.source_title}
            </CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">Page {result.page_start}{result.page_end && result.page_end !== result.page_start ? `-${result.page_end}` : ""}</Badge>
              <Badge variant="outline">Score {result.score.toFixed(2)}</Badge>
              {result.section ? <Badge variant="outline">{result.section}</Badge> : null}
            </div>
          </div>
          {result.file_id ? (
            <Button asChild variant="ghost" size="iconSm" aria-label={`Open ${result.source_title}`}>
              <Link href={`/files/${result.file_id}`}>
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-6 text-sm leading-6 text-muted-foreground">{result.text}</p>
        {result.retrieval_methods?.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {result.retrieval_methods.map((method) => (
              <span key={method} className={cn("rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground")}>
                {method}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
