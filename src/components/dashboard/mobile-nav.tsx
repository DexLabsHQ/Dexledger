"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./sidebar";
import { SignOutButton } from "./sign-out-button";
import type { StoreRow } from "@/lib/types/database";

export function MobileNav({ store }: { store: StoreRow }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookText className="size-3.5" />
          </span>
          <span className="text-sm tracking-tight">{store.store_name}</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {open && (
        <div className="fixed inset-0 top-14 z-10 bg-card lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-border pt-4">
              <SignOutButton />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
