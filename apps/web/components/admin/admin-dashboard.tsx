"use client";

import Link from "next/link";
import { Activity, ArrowUpRight, CheckCircle2, Gauge, Server, Users } from "lucide-react";
import { useAuditEvents, useMetricsSummary, useModelStatus, useReadiness, useUsers } from "@/hooks/use-admin";
import { formatDateTime } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminShell, AdminStat } from "./admin-shell";

export function AdminDashboard() {
  const readiness = useReadiness();
  const metrics = useMetricsSummary();
  const models = useModelStatus();
  const users = useUsers();
  const audit = useAuditEvents({ limit: 5 });
  const readyTone = readiness.data?.status === "ready" ? "success" : readiness.data?.status === "degraded" ? "warning" : "danger";
  const activeUsers = users.data?.items.filter((user) => user.status === "active").length ?? 0;

  return (
    <AdminShell
      title="Admin"
      description="Workspace health, access, and operations"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/system">
            System settings
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat icon={<CheckCircle2 className="size-4" />} label="Readiness" value={readiness.data?.status ?? "Checking"} detail="Live dependency probe" tone={readyTone} />
        <AdminStat icon={<Users className="size-4" />} label="Active Users" value={users.isLoading ? "..." : String(activeUsers)} detail={`${users.data?.items.length ?? 0} total accounts`} />
        <AdminStat icon={<Server className="size-4" />} label="LM Studio" value={models.data?.lm_studio.available ? "Online" : "Offline"} detail={`${Object.keys(models.data?.profiles ?? {}).length} profiles`} tone={models.data?.lm_studio.available ? "success" : "danger"} />
        <AdminStat icon={<Gauge className="size-4" />} label="Metrics" value={metrics.isLoading ? "Loading" : "Ready"} detail="Requests, retrieval, models, ingestion" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold">Dependencies</h2>
            <Badge variant={readyTone === "success" ? "success" : readyTone === "warning" ? "warning" : "danger"}>{readiness.data?.status ?? "unknown"}</Badge>
          </div>
          <div className="divide-y divide-border">
            {readiness.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="m-4 h-10" />)
            ) : (
              Object.entries(readiness.data?.dependencies ?? {}).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between gap-3 p-4">
                  <span className="text-sm font-medium">{name}</span>
                  <Badge variant={status === "ready" ? "success" : status === "degraded" ? "warning" : "danger"}>{status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold">Recent Audit</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/audit">View all</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {audit.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="m-4 h-12" />)
            ) : (
              audit.data?.items.map((event) => (
                <div key={event.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium">{event.event_type}</span>
                    <Badge variant={event.result === "success" ? "success" : "danger"}>{event.result}</Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{event.resource_type} / {event.resource_id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(event.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Metrics Snapshot</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {["requests", "models", "retrieval", "ingestion", "gpu"].map((key) => (
            <pre key={key} className="max-h-44 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {JSON.stringify(metrics.data?.[key as keyof typeof metrics.data] ?? {}, null, 2)}
            </pre>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
