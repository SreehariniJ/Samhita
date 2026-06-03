"use client";

import { FormEvent, useState } from "react";
import { Filter, ScrollText, Search } from "lucide-react";
import { useAuditEvents } from "@/hooks/use-admin";
import { formatDateTime } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorPanel } from "@/components/states/error-panel";
import { AdminShell } from "./admin-shell";

type AuditParams = {
  event_type?: string;
  actor_user_id?: string;
  limit: number;
};

export function AuditPage() {
  const [eventType, setEventType] = useState("");
  const [actorUserId, setActorUserId] = useState("");
  const [limit, setLimit] = useState("100");
  const [params, setParams] = useState<AuditParams>({ limit: 100 });
  const audit = useAuditEvents(params);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setParams({
      event_type: eventType.trim() || undefined,
      actor_user_id: actorUserId.trim() || undefined,
      limit: Number(limit)
    });
  };

  return (
    <AdminShell title="Audit Logs" description="Security and system activity">
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-3 shadow-sm lg:grid-cols-[1fr_1fr_160px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={eventType} onChange={(event) => setEventType(event.target.value)} className="pl-9" placeholder="Event type" aria-label="Event type" />
        </label>
        <Input value={actorUserId} onChange={(event) => setActorUserId(event.target.value)} placeholder="Actor user ID" aria-label="Actor user ID" />
        <div className="space-y-0">
          <Label className="sr-only">Limit</Label>
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="250">250</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button disabled={audit.isFetching}>
          <Filter className="size-4" />
          Apply
        </Button>
      </form>

      {audit.error ? (
        <ErrorPanel title="Audit logs unavailable" description={audit.error instanceof Error ? audit.error.message : undefined} action={<Button variant="outline" onClick={() => audit.refetch()}>Retry</Button>} />
      ) : audit.data?.items.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit events" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground xl:grid-cols-[1fr_180px_180px_180px_180px]">
            <span>Event</span>
            <span className="hidden xl:block">Actor</span>
            <span className="hidden xl:block">Resource</span>
            <span>Result</span>
            <span className="hidden xl:block">Time</span>
          </div>
          <div className="divide-y divide-border">
            {(audit.data?.items ?? []).map((event) => (
              <div key={event.id} className="grid gap-3 px-4 py-3 xl:grid-cols-[1fr_180px_180px_180px_180px] xl:items-center">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{event.event_type}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{event.id}</div>
                </div>
                <span className="truncate text-xs text-muted-foreground">{event.actor_user_id}</span>
                <span className="truncate text-xs text-muted-foreground">{event.resource_type} / {event.resource_id}</span>
                <Badge className="w-fit" variant={event.result === "success" ? "success" : "danger"}>{event.result}</Badge>
                <span className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</span>
                {event.metadata && Object.keys(event.metadata).length ? (
                  <pre className="max-h-32 overflow-auto rounded-md bg-muted p-2 text-xs text-muted-foreground xl:col-span-5">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
