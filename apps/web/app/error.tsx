"use client";

import { ErrorPanel } from "@/components/states/error-panel";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex h-screen items-center justify-center bg-background p-4">
      <ErrorPanel
        title="The workspace hit an error"
        description={error.message}
        action={
          <Button onClick={reset} variant="default">
            Retry
          </Button>
        }
      />
    </main>
  );
}
