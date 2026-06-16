"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/store";
import { toast } from "@/lib/toast";

export function ProfileSettingsForm({
  userId,
  defaultName,
  email,
}: {
  userId: string;
  defaultName: string;
  email: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultName);

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile(userId, { name });
      if (result?.error) toast.error("Save failed", result.error);
      else toast.success("Profile updated");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="p-name">Display name</Label>
        <Input
          id="p-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="p-email">Email address</Label>
        <Input id="p-email" type="email" value={email} disabled className="opacity-60" />
        <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
      </div>
      <Button variant="accent" onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </div>
  );
}
