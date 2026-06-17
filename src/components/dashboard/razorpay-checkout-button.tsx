"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import {
  createSubscription,
  verifySubscriptionPayment,
} from "@/lib/actions/razorpay";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutButtonProps {
  userEmail?: string;
  userName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function RazorpayCheckoutButton({
  userEmail,
  userName,
  className,
  children,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function loadRazorpayScript(): Promise<boolean> {
    if (window.Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Check your internet connection.");
        return;
      }

      // 2. Create Razorpay subscription server-side
      const result = await createSubscription();

      if (result.error || !result.subscriptionId || !result.keyId) {
        setError(result.error ?? "Failed to initialize payment.");
        return;
      }

      // 3. Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: result.keyId,
        subscription_id: result.subscriptionId,
        name: "DexLedger",
        description: "Pro Plan — ₹299/month",
        theme: { color: "#f59e0b" },
        prefill: {
          email: userEmail,
          name: userName,
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          // 4. Verify signature server-side — never trust client
          const verifyResult = await verifySubscriptionPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyResult.error) {
            setError(verifyResult.error);
            setLoading(false);
            return;
          }

          // 5. Redirect to billing with success
          router.push("/billing?upgraded=true");
          router.refresh();
        },
      });

      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Opening checkout…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            {children ?? "Upgrade to Pro"}
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
