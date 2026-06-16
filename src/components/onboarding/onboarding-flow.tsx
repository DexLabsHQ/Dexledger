"use client";

import { useState, useTransition } from "react";
import { BookText, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "@/lib/actions/store";
import type { BusinessType } from "@/lib/types/database";
import { BUSINESS_TYPE_LABELS } from "@/lib/types/database";

const BUSINESS_TYPES: BusinessType[] = [
  "pharmacy",
  "grocery_store",
  "hardware_store",
  "stationery_shop",
  "cement_supplier",
  "distributor",
  "warehouse",
  "other",
];

const TOTAL_STEPS = 5;

export function OnboardingFlow({ defaultStoreName }: { defaultStoreName: string }) {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState(defaultStoreName);
  const [storeType, setStoreType] = useState<BusinessType | null>(null);
  const [inventoryEnabled, setInventoryEnabled] = useState(true);
  const [creditEnabled, setCreditEnabled] = useState(true);
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canContinue =
    (step === 1 && storeName.trim().length > 0) ||
    (step === 2 && storeType !== null) ||
    step === 3 ||
    step === 4 ||
    step === 5;

  function next() {
    setError(null);
    if (step === 1 && !storeName.trim()) {
      setError("Please enter your business name.");
      return;
    }
    if (step === 2 && !storeType) {
      setError("Please select a business type.");
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      submit();
    }
  }

  function back() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  function submit() {
    if (!storeType) return;
    startTransition(async () => {
      const result = await completeOnboarding({
        storeName,
        storeType,
        inventoryEnabled,
        creditEnabled,
        expiryEnabled,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookText className="size-4.5" />
        </span>
        <span className="text-base tracking-tight">DexLedger</span>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} />
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold">What&apos;s your business called?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is how your store will appear across DexLedger and on your reports.
          </p>
          <div className="mt-6 space-y-2">
            <Label htmlFor="store-name">Business name</Label>
            <Input
              id="store-name"
              placeholder="e.g. Sharma General Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold">What type of business do you run?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This helps us tailor categories and reports to your workflow.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-2">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setStoreType(type)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                  storeType === type
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/40"
                )}
              >
                {BUSINESS_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <ToggleStep
          title="Track inventory?"
          description="Manage product stock, quantities, and low-stock thresholds."
          checked={inventoryEnabled}
          onChange={setInventoryEnabled}
        />
      )}

      {step === 4 && (
        <ToggleStep
          title="Track customer credit (udhaar)?"
          description="Record purchases and payments per customer, with automatic balance calculation."
          checked={creditEnabled}
          onChange={setCreditEnabled}
        />
      )}

      {step === 5 && (
        <ToggleStep
          title="Track product expiry dates?"
          description="Useful for pharmacies and grocery stores managing perishable or dated stock."
          checked={expiryEnabled}
          onChange={setExpiryEnabled}
        />
      )}

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 1 || isPending}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button variant="accent" onClick={next} disabled={!canContinue || isPending}>
          {isPending ? (
            "Setting up..."
          ) : step === TOTAL_STEPS ? (
            <>
              Finish setup <Check className="size-4" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ToggleStep({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-center justify-between rounded-lg border border-border px-4 py-4">
        <div>
          <p className="text-sm font-medium">{checked ? "Enabled" : "Disabled"}</p>
          <p className="text-xs text-muted-foreground">You can change this later in Settings.</p>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  );
}
