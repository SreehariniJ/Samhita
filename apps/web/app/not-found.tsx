import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex h-screen items-center justify-center bg-background p-4">
      <section className="glass-panel max-w-md rounded-lg p-6 text-center shadow-glow">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This route is not available in the workspace.</p>
        <Button asChild className="mt-5">
          <Link href="/chat">Return to chat</Link>
        </Button>
      </section>
    </main>
  );
}
