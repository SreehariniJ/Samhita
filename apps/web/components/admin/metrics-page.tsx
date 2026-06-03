"use client";

import { RefreshCcw } from "lucide-react";
import { useMetricsSummary } from "@/hooks/use-admin";
import type { MetricsSummary } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorPanel } from "@/components/states/error-panel";
import { AdminShell } from "./admin-shell";

const sections: Array<keyof MetricsSummary> = ["requests", "models", "retrieval", "ingestion", "gpu"];

export function MetricsPage() {
  const metrics = useMetricsSummary();

  return (
    <AdminShell
      title="Metrics"
      description="Local operational summary"
      actions={
        <Button variant="outline" size="sm" onClick={() => metrics.refetch()} disabled={metrics.isFetching}>
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      }
    >
      {metrics.error ? (
        <ErrorPanel title="Metrics unavailable" description={metrics.error instanceof Error ? metrics.error.message : undefined} action={<Button variant="outline" onClick={() => metrics.refetch()}>Retry</Button>} />
      ) : metrics.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <section key={section} className="rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border p-4">
                <h2 className="text-sm font-semibold capitalize">{section}</h2>
              </div>
              <pre className="chat-scrollbar max-h-[28rem] overflow-auto p-4 text-xs leading-5 text-muted-foreground">
                {JSON.stringify(metrics.data?.[section] ?? {}, null, 2)}
              </pre>
            </section>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
