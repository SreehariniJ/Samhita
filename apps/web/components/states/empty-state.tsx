import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/25 p-6 text-center", className)}>
      <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-background shadow-sm">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
