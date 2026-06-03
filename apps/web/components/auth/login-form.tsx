"use client";

import { useState } from "react";
import { BrainCircuit, Loader2, LockKeyhole } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="glass-panel w-full max-w-md shadow-glow">
      <CardHeader className="space-y-4">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <BrainCircuit className="size-5" />
        </div>
        <div>
          <CardTitle className="text-xl">Samhita AI</CardTitle>
          <CardDescription>Private enterprise workspace</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate({ email, password });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={12}
            />
          </div>
          {login.error ? <p className="text-sm text-destructive">{getErrorMessage(login.error)}</p> : null}
          <Button className="w-full" disabled={login.isPending || email.length === 0 || password.length === 0}>
            {login.isPending ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
