import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthForm } from "@/components/landing/auth-form";
import { GoogleButton } from "@/components/landing/google-button";
import { signInWithEmail } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Log in to DexLedger</CardTitle>
        <CardDescription>Welcome back. Enter your details to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params.verify && (
          <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
            Check your email to verify your account, then log in.
          </p>
        )}
        {params.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Something went wrong signing in. Please try again.
          </p>
        )}

        <GoogleButton />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <AuthForm action={signInWithEmail} mode="login" />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Start free trial
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
