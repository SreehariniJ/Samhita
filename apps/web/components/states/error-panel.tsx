import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ErrorPanel({
  title,
  description,
  action,
  className
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-destructive/25 bg-destructive/5 p-4", className)} role="alert">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <AlertTriangle className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-destructive">{title}</h2>
          {description ? <p className="mt-1 break-words text-sm text-muted-foreground">{description}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
