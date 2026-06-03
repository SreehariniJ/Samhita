import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingCard({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("glass-panel flex min-w-60 items-center gap-3 rounded-lg p-4 text-sm text-muted-foreground shadow-sm", className)} role="status" aria-live="polite">
      <Loader2 className="size-4 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}
