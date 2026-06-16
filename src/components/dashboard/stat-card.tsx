import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "warning" | "success" | "danger";
}

export function StatCard({ title, value, icon: Icon, description, variant = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            variant === "default" && "bg-accent/10 text-accent",
            variant === "warning" && "bg-destructive/10 text-destructive",
            variant === "success" && "bg-success/10 text-success",
            variant === "danger" && "bg-destructive/10 text-destructive"
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
