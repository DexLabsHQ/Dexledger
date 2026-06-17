"use client";

import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelSubscription } from "@/lib/actions/razorpay";
import { useRouter } from "next/navigation";

export function CancelSubscriptionButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    setError(null);

    const result = await cancelSubscription();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <XCircle className="mr-1.5 size-4" />
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel your subscription?</DialogTitle>
          <DialogDescription>
            Your Pro access will continue until the end of the current billing period.
            After that, your account will revert to the Free plan.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-1.5 rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          <li>✓ Access continues until billing period ends</li>
          <li>✗ Inventory limit drops to 50 products</li>
          <li>✗ Customer limit drops to 25</li>
          <li>✗ Credit / Udhaar access removed</li>
          <li>✗ WhatsApp & export features removed</li>
        </ul>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cancelling…
              </>
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
