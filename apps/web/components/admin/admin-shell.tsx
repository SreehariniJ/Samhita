"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Gauge, ScrollText, Settings, Users } from "lucide-react";
import { isAdmin } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/states/error-panel";
import { RouteFrame } from "@/components/states/route-frame";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: Activity },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
  { href: "/admin/metrics", label: "Metrics", icon: Gauge },
  { href: "/admin/system", label: "System", icon: Settings }
];

export function AdminShell({
  title,
  description,
  actions,
  children
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (!isAdmin(user)) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <ErrorPanel
          title="Admin access required"
          description="Your current account cannot open this area."
          action={
            <Button asChild variant="outline">
              <Link href="/chat">Return to chat</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <RouteFrame title={title} description={description} actions={actions} className="max-w-7xl">
      <nav className="flex gap-1 overflow-x-auto border-b border-border pb-2" aria-label="Admin navigation">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground"
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </RouteFrame>
  );
}

export function AdminStat({
  icon,
  label,
  value,
  detail,
  tone = "default"
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : tone === "warning"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : tone === "danger"
          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : "bg-primary/10 text-primary";

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
          {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        </div>
        <span className={cn("flex size-9 items-center justify-center rounded-md", toneClass)}>{icon}</span>
      </div>
    </section>
  );
}
