import Link from "next/link";
import { BookText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { NavUserMenu } from "@/components/landing/nav-user-menu";

/**
 * Server component — reads auth session on the server so there's no flash.
 * Logged-out → shows Log In + Sign Up.
 * Logged-in  → shows Dashboard link + user avatar menu.
 */
export async function LandingNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch display name if logged in
  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", user.id)
      .maybeSingle();
    displayName = profile?.name ?? profile?.email ?? user.email ?? null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo — navigates to /dashboard when logged in, / when logged out */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookText className="size-4.5" />
          </span>
          <span className="text-base tracking-tight">DexLedger</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#businesses" className="transition-colors hover:text-foreground">
            Supported Businesses
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              {/* Client component handles avatar dropdown */}
              <NavUserMenu displayName={displayName} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button variant="accent" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
