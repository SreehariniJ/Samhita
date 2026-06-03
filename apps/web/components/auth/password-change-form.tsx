"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { useChangePassword } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordChangeForm() {
  const mutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <Card className="glass-panel w-full max-w-md shadow-glow">
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-2 w-fit px-2">
          <Link href="/settings">
            <ArrowLeft className="size-4" />
            Settings
          </Link>
        </Button>
        <CardTitle className="text-xl">Change Password</CardTitle>
        <CardDescription>Update local account credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({
              current_password: currentPassword,
              new_password: newPassword
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" required minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </div>
          {mutation.error ? <p className="text-sm text-destructive">{getErrorMessage(mutation.error)}</p> : null}
          <Button className="w-full" disabled={mutation.isPending || currentPassword.length === 0 || newPassword.length < 12}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Save password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
