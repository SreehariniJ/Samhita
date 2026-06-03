"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, Save, UserPlus, Users } from "lucide-react";
import { useCreateUser, useUpdateUser, useUsers } from "@/hooks/use-admin";
import type { Role, User } from "@/lib/api/types";
import { formatDateTime } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorPanel } from "@/components/states/error-panel";
import { AdminShell } from "./admin-shell";

const roles: Role[] = ["user", "power_user", "admin"];

export function UsersPage() {
  const users = useUsers();

  return (
    <AdminShell title="Users" description="Account access and role management" actions={<CreateUserDialog />}>
      {users.error ? (
        <ErrorPanel title="Users unavailable" description={users.error instanceof Error ? users.error.message : undefined} action={<Button variant="outline" onClick={() => users.refetch()}>Retry</Button>} />
      ) : users.data?.items.length === 0 ? (
        <EmptyState icon={Users} title="No users" action={<CreateUserDialog />} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground xl:grid-cols-[1fr_220px_180px_180px_auto]">
            <span>User</span>
            <span className="hidden xl:block">Role</span>
            <span className="hidden xl:block">Status</span>
            <span className="hidden xl:block">Created</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-border">
            {(users.data?.items ?? []).map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function CreateUserDialog() {
  const create = useCreateUser();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");

  useEffect(() => {
    if (create.isSuccess) {
      setOpen(false);
      setEmail("");
      setDisplayName("");
      setPassword("");
      setRole("user");
    }
  }, [create.isSuccess]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate({
      email,
      display_name: displayName,
      password,
      roles: [role]
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          New user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>Add a local workspace account.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input id="create-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-name">Display name</Label>
              <Input id="create-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input id="create-password" type="password" minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending || password.length < 12}>
              {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserRow({ user }: { user: User }) {
  const update = useUpdateUser();
  const [displayName, setDisplayName] = useState(user.display_name);
  const [role, setRole] = useState<Role>(user.roles[0] ?? "user");
  const [status, setStatus] = useState<User["status"]>(user.status);

  useEffect(() => {
    setDisplayName(user.display_name);
    setRole(user.roles[0] ?? "user");
    setStatus(user.status);
  }, [user.display_name, user.roles, user.status]);

  const dirty = displayName !== user.display_name || role !== (user.roles[0] ?? "user") || status !== user.status;

  return (
    <div className="grid gap-3 px-4 py-3 xl:grid-cols-[1fr_220px_180px_180px_auto] xl:items-center">
      <div className="min-w-0 space-y-2">
        <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} aria-label={`Display name for ${user.email}`} />
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="truncate">{user.email}</span>
          <Badge variant="outline">{user.id}</Badge>
        </div>
      </div>
      <div className="space-y-1 xl:space-y-0">
        <Label className="xl:hidden">Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 xl:space-y-0">
        <Label className="xl:hidden">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as User["status"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="disabled">disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <span className="text-xs text-muted-foreground">{formatDateTime(user.created_at)}</span>
      <Button
        size="sm"
        variant="outline"
        disabled={!dirty || update.isPending || displayName.trim().length === 0}
        onClick={() =>
          update.mutate({
            userId: user.id,
            request: {
              display_name: displayName.trim(),
              roles: [role],
              status
            }
          })
        }
      >
        {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save
      </Button>
    </div>
  );
}
