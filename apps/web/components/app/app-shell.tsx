"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { useSessionRecovery } from "@/hooks/use-auth";
import { CitationDrawer } from "@/components/citations/citation-drawer";
import { ErrorPanel } from "@/components/states/error-panel";
import { LoadingCard } from "@/components/states/loading-card";
import { OfflineBanner } from "@/components/states/offline-banner";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { MobileWorkspaceBar } from "./mobile-workspace-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSessionRecovery();

  useEffect(() => {
    if (session.error instanceof ApiError && session.error.status === 401) {
      router.replace("/login");
    }
  }, [router, session.error]);

  if (session.isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-background p-4">
        <LoadingCard label="Recovering session" />
      </main>
    );
  }

  if (session.error && !(session.error instanceof ApiError && session.error.status === 401)) {
    return (
      <main className="flex h-screen items-center justify-center bg-background p-4">
        <ErrorPanel
          title="Workspace unavailable"
          description={session.error instanceof Error ? session.error.message : "The session check could not complete."}
          action={
            <Button onClick={() => session.refetch()} variant="outline">
              Retry
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <MobileWorkspaceBar />
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
      <CitationDrawer />
    </div>
  );
}
