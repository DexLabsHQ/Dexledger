"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("justify-start text-muted-foreground hover:text-foreground", className)}
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOut className="size-4" />
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
