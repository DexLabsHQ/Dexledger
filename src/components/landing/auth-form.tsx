"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/actions/auth";

interface AuthFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  mode: "login" | "signup";
}

export function AuthForm({ action, mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" placeholder="Priya Sharma" required />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@business.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" minLength={6} required />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
        {isPending ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </Button>
    </form>
  );
}
