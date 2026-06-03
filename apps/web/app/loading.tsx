import { LoadingCard } from "@/components/states/loading-card";

export default function Loading() {
  return (
    <main className="flex h-screen items-center justify-center bg-background p-4">
      <LoadingCard label="Loading workspace" />
    </main>
  );
}
