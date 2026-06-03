"use client";

import { WifiOff } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";

export function OfflineBanner() {
  const offline = useOffline();

  if (!offline) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-200" role="status">
      <WifiOff className="size-4" />
      <span>Offline</span>
    </div>
  );
}
