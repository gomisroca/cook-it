"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { post } from "@/services/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await post("/auth/reset-password", { token, password });
      router.push("/login?reset=success");
    } catch {
      setError("This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="text-muted-foreground">Invalid reset link.</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-xs md:w-md p-4 rounded-md space-y-4"
    >
      <div>
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>
      <FieldSet>
        <Field>
          <FieldLabel>New password</FieldLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </Field>
        <Field>
          <FieldLabel>Confirm password</FieldLabel>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </Field>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </FieldSet>
    </form>
  );
}
