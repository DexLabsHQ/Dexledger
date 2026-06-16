import Link from "next/link";
import { BookText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 px-6 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookText className="size-4.5" />
        </span>
        <span className="text-base tracking-tight">DexLedger</span>
      </Link>
      {children}
    </div>
  );
}
