"use client";

import { Cpu } from "lucide-react";
import { useModelStatus } from "@/hooks/use-admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ModelSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const models = useModelStatus();
  const profiles = Object.keys(models.data?.profiles ?? {});
  const resolvedProfiles = profiles.length ? profiles : [value || "reasoning"];

  return (
    <div className="flex items-center gap-2">
      <Cpu className="hidden size-4 text-muted-foreground sm:block" />
      <Select value={value || resolvedProfiles[0]} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {resolvedProfiles.map((profile) => (
            <SelectItem key={profile} value={profile}>
              {profile}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
