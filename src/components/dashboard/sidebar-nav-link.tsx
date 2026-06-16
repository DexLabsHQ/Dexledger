"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function SidebarNavLink({ href, label, icon: Icon }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent/10 text-accent"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}
