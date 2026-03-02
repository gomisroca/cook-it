"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { del } from "@/services/api-client";
import { sileo } from "sileo";

interface Props {
  slug: string;
}

export default function DeleteButton({ slug }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setLoading(true);
    try {
      await del(`/recipes/slug/${slug}`);
      sileo.success({ title: "Recipe deleted" });
      router.push("/recipes");
    } catch {
      sileo.error({ title: "Failed to delete recipe" });
      setLoading(false);
    }
  }

  return (
    <Button
      variant={confirming ? "destructive" : "outline"}
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="gap-2"
    >
      <Trash2 size={14} />
      {confirming ? "Are you sure?" : "Delete"}
    </Button>
  );
}
