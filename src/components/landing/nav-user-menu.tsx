"use client";

import Link from "next/link";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavUserMenuProps {
  displayName: string | null;
}

export function NavUserMenu({ displayName }: NavUserMenuProps) {
  const router = useRouter();
  const initials = (displayName ?? "U").slice(0, 2).toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="size-8 cursor-pointer">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {displayName && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
              {displayName}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <User className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
<DropdownMenuSeparator />

<DropdownMenuItem
  onClick={handleSignOut}
  className="flex items-center gap-2 text-destructive focus:text-destructive"
>
  <LogOut className="size-4" />
  Sign out
</DropdownMenuItem>

</DropdownMenuContent>
</DropdownMenu>
);
}
