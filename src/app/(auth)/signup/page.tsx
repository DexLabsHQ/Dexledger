import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthForm } from "@/components/landing/auth-form";
import { GoogleButton } from "@/components/landing/google-button";
import { signUpWithEmail } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Start your free trial</CardTitle>
        <CardDescription>No credit card required. Set up in minutes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <AuthForm action={signUpWithEmail} mode="signup" />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
