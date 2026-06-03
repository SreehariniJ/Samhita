"use client";

import { Menu, MessageSquarePlus } from "lucide-react";
import { useCreateConversation } from "@/hooks/use-conversations";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";

export function MobileWorkspaceBar() {
  const createConversation = useCreateConversation();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <div className="flex h-14 items-center justify-between border-b border-border px-3 lg:hidden">
      <IconButton label="Open navigation" onClick={() => setSidebarOpen(true)}>
        <Menu className="size-4" />
      </IconButton>
      <div className="text-sm font-semibold">Samhita AI</div>
      <Button size="icon" variant="ghost" aria-label="New chat" onClick={() => createConversation.mutate({})}>
        <MessageSquarePlus className="size-4" />
      </Button>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>
    </div>
  );
}
