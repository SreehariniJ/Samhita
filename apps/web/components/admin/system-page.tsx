"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, ServerCog } from "lucide-react";
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/use-settings";
import type { SystemSettings } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorPanel } from "@/components/states/error-panel";
import { AdminShell } from "./admin-shell";

type RetrievalKey = keyof SystemSettings["retrieval"];

const retrievalFields: Array<{ key: RetrievalKey; label: string; step?: string }> = [
  { key: "dense_top_k", label: "Dense top K" },
  { key: "bm25_top_k", label: "BM25 top K" },
  { key: "graph_top_k", label: "Graph top K" },
  { key: "rerank_top_k", label: "Rerank top K" },
  { key: "citation_min_confidence", label: "Citation confidence", step: "0.01" }
];

export function SystemPage() {
  const system = useSystemSettings();
  const update = useUpdateSystemSettings();
  const [draft, setDraft] = useState<SystemSettings | null>(null);
  const [extensionsText, setExtensionsText] = useState("");

  useEffect(() => {
    if (!system.data) return;
    setDraft(system.data);
    setExtensionsText(system.data.uploads.allowed_extensions.join(", "));
  }, [system.data]);

  const save = () => {
    if (!draft) return;
    update.mutate({
      ...draft,
      uploads: {
        ...draft.uploads,
        allowed_extensions: extensionsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      }
    });
  };

  return (
    <AdminShell
      title="System Settings"
      description="Model profiles, retrieval, and upload limits"
      actions={
        <Button onClick={save} disabled={!draft || update.isPending}>
          {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save
        </Button>
      }
    >
      {system.error ? (
        <ErrorPanel title="System settings unavailable" description={system.error instanceof Error ? system.error.message : undefined} action={<Button variant="outline" onClick={() => system.refetch()}>Retry</Button>} />
      ) : system.isLoading || !draft ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Retrieval</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {retrievalFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type="number"
                      step={field.step}
                      value={draft.retrieval[field.key]}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                retrieval: {
                                  ...current.retrieval,
                                  [field.key]: field.key === "citation_min_confidence" ? Number.parseFloat(event.target.value) : Number.parseInt(event.target.value, 10)
                                }
                              }
                            : current
                        )
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploads</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Max file size MB</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    min={1}
                    value={draft.uploads.max_file_size_mb}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              uploads: {
                                ...current.uploads,
                                max_file_size_mb: Number.parseInt(event.target.value, 10)
                              }
                            }
                          : current
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-extensions">Allowed extensions</Label>
                  <Input id="allowed-extensions" value={extensionsText} onChange={(event) => setExtensionsText(event.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <ServerCog className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Model Profiles</h2>
            </div>
            <div className="grid gap-3 p-4 lg:grid-cols-2">
              {Object.entries(draft.model_profiles).map(([name, profile]) => (
                <div key={name} className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold">{name}</h3>
                    <Badge variant="secondary">{profile.temperature}</Badge>
                  </div>
                  <dl className="space-y-2 text-xs">
                    <ProfileRow label="Chat" value={profile.chat_model} />
                    <ProfileRow label="Vision" value={profile.vision_model} />
                    <ProfileRow label="Embedding" value={profile.embedding_model} />
                    <ProfileRow label="Output" value={`${profile.max_output_tokens} tokens`} />
                    <ProfileRow label="Context" value={`${profile.context_window_tokens} tokens`} />
                  </dl>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[86px_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
