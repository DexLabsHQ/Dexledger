"use client";

import Link from "next/link";
import {
  BookText,
  LayoutDashboard,
  Package,
  Users,
  Wallet,
  FileBarChart,
  Settings,
  Home,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarNavLink } from "./sidebar-nav-link";
import { SignOutButton } from "./sign-out-button";
import type { StoreRow } from "@/lib/types/database";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/credit", label: "Credit / Udhaar", icon: Wallet },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  store,
  userName,
  userEmail,
}: {
  store: StoreRow;
  userName: string | null;
  userEmail: string;
}) {
  const displayName = userName || userEmail;
  const initials = (userName || userEmail).slice(0, 2).toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Logo → /dashboard (logged-in context) */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookText className="size-4.5" />
          </span>
          <span className="text-base tracking-tight">DexLedger</span>
        </Link>
      </div>

      {/* Store info */}
      <div className="border-b border-border px-6 py-4">
        <p className="truncate text-sm font-medium">{store.store_name}</p>
        <p className="text-xs text-muted-foreground">{labelForType(store.store_type)}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>

      {/* Back to Homepage */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Home className="size-4" />
          ← Back to Homepage
        </Link>
      </div>

      {/* User footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <SignOutButton className="mt-3 w-full" />
      </div>
    </aside>
  );
}

function labelForType(type: string) {
  return type
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export { NAV_ITEMS };
