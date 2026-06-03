"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  Files,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MessageSquarePlus,
  Pin,
  Search,
  Settings,
  Shield,
  UserCircle
} from "lucide-react";
import { useConversations, useConversationSearch, useCreateConversation } from "@/hooks/use-conversations";
import { useLogout } from "@/hooks/use-auth";
import { formatRelativeDate } from "@/lib/dates";
import { initials } from "@/lib/messages";
import { isAdmin } from "@/lib/rbac";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-80 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
      <SidebarContent />
    </aside>
  );
}

export function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const conversations = useConversations(showArchived);
  const search = useConversationSearch(query);
  const createConversation = useCreateConversation();
  const logout = useLogout();

  const items = useMemo(
    () => (query.trim() ? search.data?.items ?? [] : conversations.data?.items ?? []),
    [conversations.data?.items, query, search.data?.items]
  );
  const pinned = useMemo(() => items.filter((item) => item.pinned), [items]);
  const regular = useMemo(() => items.filter((item) => !item.pinned), [items]);

  const closeMobile = () => {
    if (mobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessageSquare className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">Samhita AI</div>
            <div className="truncate text-xs text-sidebar-foreground/60">Private workspace</div>
          </div>
        </div>
        <Button variant="sidebar" className="h-10 w-full bg-white/10" onClick={() => createConversation.mutate({})} disabled={createConversation.isPending}>
          <MessageSquarePlus className="size-4" />
          New Chat
        </Button>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sidebar-foreground/50" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="border-sidebar-border bg-white/10 pl-9 text-sidebar-foreground placeholder:text-sidebar-foreground/45"
            placeholder="Search chats"
          />
        </label>
      </div>

      <div className="flex items-center justify-between px-4 pb-2 pt-1 text-xs font-medium text-sidebar-foreground/60">
        <span>{query.trim() ? "Results" : showArchived ? "Archived" : "Chats"}</span>
        <button className="inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-white/10" onClick={() => setShowArchived((value) => !value)}>
          <Archive className="size-3.5" />
          {showArchived ? "Active" : "Archive"}
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2">
        {(conversations.isLoading || search.isLoading) && !items.length ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-10 bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-3">
            {pinned.length ? (
              <ConversationGroup title="Pinned" icon={<Pin className="size-3.5" />}>
                {pinned.map((conversation) => (
                  <ConversationLink key={conversation.id} active={pathname === `/chat/${conversation.id}`} href={`/chat/${conversation.id}`} onClick={closeMobile} title={conversation.title} date={conversation.last_message_at} />
                ))}
              </ConversationGroup>
            ) : null}
            <ConversationGroup title={showArchived ? "Archived" : "Recent"} icon={<MessageSquare className="size-3.5" />}>
              {regular.length ? (
                regular.map((conversation) => (
                  <ConversationLink key={conversation.id} active={pathname === `/chat/${conversation.id}`} href={`/chat/${conversation.id}`} onClick={closeMobile} title={conversation.title} date={conversation.last_message_at} />
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-sidebar-foreground/50">No conversations</p>
              )}
            </ConversationGroup>
          </div>
        )}
      </ScrollArea>

      <nav className="space-y-1 border-t border-sidebar-border p-3">
        <SidebarNavLink href="/search" active={pathname === "/search"} onClick={closeMobile} icon={<Search className="size-4" />} label="Search" />
        <SidebarNavLink href="/files" active={pathname.startsWith("/files")} onClick={closeMobile} icon={<Files className="size-4" />} label="Files" />
        <SidebarNavLink href="/settings" active={pathname.startsWith("/settings")} onClick={closeMobile} icon={<Settings className="size-4" />} label="Settings" />
        {isAdmin(user) ? <SidebarNavLink href="/admin" active={pathname.startsWith("/admin")} onClick={closeMobile} icon={<Shield className="size-4" />} label="Admin" /> : null}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-white/10">
              <Avatar className="size-9">
                <AvatarFallback>{initials(user?.display_name ?? "User")}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user?.display_name ?? "User"}</span>
                <span className="block truncate text-xs text-sidebar-foreground/55">{user?.email ?? "local account"}</span>
              </span>
              <ChevronDown className="size-4 text-sidebar-foreground/55" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserCircle className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            {isAdmin(user) ? (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboard className="size-4" />
                  Admin
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout.mutate()}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ConversationGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-1 flex items-center gap-1.5 px-3 text-xs font-medium text-sidebar-foreground/50">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function ConversationLink({ href, title, date, active, onClick }: { href: string; title: string; date: string; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10",
        active && "bg-sidebar-active text-white"
      )}
    >
      <span className="min-w-0 flex-1 truncate">{title || "Untitled chat"}</span>
      <span className="shrink-0 text-[11px] text-sidebar-foreground/45 group-hover:text-sidebar-foreground/70">{formatRelativeDate(date)}</span>
    </Link>
  );
}

function SidebarNavLink({ href, active, icon, label, onClick }: { href: string; active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={cn("flex h-9 items-center gap-2 rounded-md px-3 text-sm hover:bg-white/10", active && "bg-white/15 text-white")}>
      {icon}
      {label}
    </Link>
  );
}
