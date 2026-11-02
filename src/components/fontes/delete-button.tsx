"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteFonteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Deletar esta fonte?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fontes/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/fontes");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
      {loading ? "…" : "Deletar"}
    </Button>
  );
}
