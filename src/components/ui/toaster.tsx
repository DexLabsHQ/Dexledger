"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useToastState } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, subscribe } = useToastState();

  useEffect(() => {
    const unsub = subscribe();
    return unsub;
  }, [subscribe]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex min-w-72 max-w-sm items-start gap-3 rounded-xl border bg-card p-4 shadow-lg",
            t.variant === "success" && "border-success/30",
            t.variant === "error" && "border-destructive/30"
          )}
        >
          {t.variant === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />}
          {t.variant === "error" && <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
          {t.variant === "default" && <Info className="mt-0.5 size-4 shrink-0 text-accent" />}
          <div className="flex-1">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
