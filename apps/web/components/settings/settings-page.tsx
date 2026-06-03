"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, Moon, Save, Settings2, Shield, Sun, Wand2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useModelStatus } from "@/hooks/use-admin";
import { useUpdateUserSettings, useUserSettings } from "@/hooks/use-settings";
import type { CitationDisplay, ThemeMode, UserSettingsUpdate } from "@/lib/api/types";
import { isAdmin } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorPanel } from "@/components/states/error-panel";
import { LoadingCard } from "@/components/states/loading-card";
import { RouteFrame } from "@/components/states/route-frame";

const citationModes: Array<{ value: CitationDisplay; label: string }> = [
  { value: "inline_and_drawer", label: "Inline + drawer" },
  { value: "inline", label: "Inline" },
  { value: "drawer", label: "Drawer" }
];

const codeThemes = ["github-dark", "github-light", "atom-one-dark", "atom-one-light"];

export function SettingsPage() {
  const { setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const settings = useUserSettings();
  const models = useModelStatus();
  const update = useUpdateUserSettings();
  const [draft, setDraft] = useState<UserSettingsUpdate>({});

  useEffect(() => {
    if (!settings.data) return;
    setDraft(settings.data);
    setTheme(settings.data.theme);
  }, [setTheme, settings.data]);

  const modelProfiles = useMemo(() => {
    const profiles = Object.keys(models.data?.profiles ?? {});
    if (profiles.length) return profiles;
    return [settings.data?.default_model_profile ?? "reasoning"];
  }, [models.data?.profiles, settings.data?.default_model_profile]);

  const setValue = <TKey extends keyof UserSettingsUpdate>(key: TKey, value: UserSettingsUpdate[TKey]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "theme") {
      setTheme(value as ThemeMode);
    }
  };

  const save = () => {
    update.mutate(draft);
  };

  if (settings.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <LoadingCard label="Loading settings" />
      </div>
    );
  }

  if (settings.error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <ErrorPanel title="Settings unavailable" description={settings.error instanceof Error ? settings.error.message : undefined} action={<Button onClick={() => settings.refetch()} variant="outline">Retry</Button>} />
      </div>
    );
  }

  return (
    <RouteFrame
      title="Settings"
      description={user?.email}
      actions={
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save
        </Button>
      }
    >
      <Tabs defaultValue="preferences" className="min-h-0">
        <TabsList className="grid w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="grid gap-4 lg:grid-cols-2">
          <SettingCard icon={<Sun className="size-4" />} title="Theme" description="Light, dark, or system appearance.">
            <SegmentedSelect
              label="Theme"
              value={draft.theme ?? "system"}
              onChange={(value) => setValue("theme", value as ThemeMode)}
              options={[
                { value: "system", label: "System" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" }
              ]}
            />
          </SettingCard>

          <SettingCard icon={<Wand2 className="size-4" />} title="Responses" description="Streaming and citation presentation.">
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="streaming-enabled">Streaming</Label>
                <p className="mt-1 text-xs text-muted-foreground">Show assistant tokens as they arrive.</p>
              </div>
              <Switch
                id="streaming-enabled"
                checked={draft.streaming_enabled ?? true}
                onCheckedChange={(checked) => setValue("streaming_enabled", checked)}
              />
            </div>
            <SegmentedSelect
              label="Citations"
              value={draft.citation_display ?? "inline_and_drawer"}
              onChange={(value) => setValue("citation_display", value as CitationDisplay)}
              options={citationModes}
            />
          </SettingCard>
        </TabsContent>

        <TabsContent value="models" className="grid gap-4 lg:grid-cols-2">
          <SettingCard icon={<Settings2 className="size-4" />} title="Default Model" description="Profile used for new conversations.">
            <SegmentedSelect
              label="Model profile"
              value={draft.default_model_profile ?? modelProfiles[0]}
              onChange={(value) => setValue("default_model_profile", value)}
              options={modelProfiles.map((profile) => ({ value: profile, label: profile }))}
            />
            {models.data ? (
              <div className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">LM Studio</span>
                  <Badge variant={models.data.lm_studio.available ? "success" : "danger"}>
                    {models.data.lm_studio.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <p className="mt-2 truncate text-xs text-muted-foreground">{models.data.lm_studio.endpoint}</p>
              </div>
            ) : null}
          </SettingCard>

          <SettingCard icon={<Moon className="size-4" />} title="Markdown" description="Code block highlighting preference.">
            <SegmentedSelect
              label="Code theme"
              value={draft.markdown_code_theme ?? "github-dark"}
              onChange={(value) => setValue("markdown_code_theme", value)}
              options={codeThemes.map((theme) => ({ value: theme, label: theme }))}
            />
          </SettingCard>
        </TabsContent>

        <TabsContent value="account" className="grid gap-4 lg:grid-cols-2">
          <SettingCard icon={<KeyRound className="size-4" />} title="Password" description="Update local credentials.">
            <Button asChild variant="outline" className="w-fit">
              <Link href="/change-password">
                <KeyRound className="size-4" />
                Change password
              </Link>
            </Button>
          </SettingCard>

          {isAdmin(user) ? (
            <SettingCard icon={<Shield className="size-4" />} title="Administration" description="Workspace controls and system health.">
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/system">System</Link>
                </Button>
              </div>
            </SettingCard>
          ) : null}
        </TabsContent>
      </Tabs>
    </RouteFrame>
  );
}

function SettingCard({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function SegmentedSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
