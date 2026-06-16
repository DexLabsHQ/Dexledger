import Link from "next/link";
import { ArrowRight, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to digitize your shop&apos;s ledger?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-primary-foreground/70">
          Join local businesses already tracking inventory, customers, and
          credit with DexLedger. Start your free trial today.
        </p>
        <Button size="lg" variant="accent" className="mt-8" asChild>
          <Link href="/signup">
            Start Free Trial <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookText className="size-4" />
          </span>
          DexLedger
        </div>
        <p>© {new Date().getFullYear()} DexLedger. All rights reserved.</p>
      </div>
    </footer>
  );
}
