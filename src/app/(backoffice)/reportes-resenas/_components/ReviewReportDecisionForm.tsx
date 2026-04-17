"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type ReviewReportDecisionFormProps = {
  reportId: number;
};

export function ReviewReportDecisionForm({
  reportId,
}: ReviewReportDecisionFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(status: "resolved" | "hidden") {
    try {
      setLoading(true);

      await fetch(`/api/backoffice/review-reports/${reportId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          resolutionNotes: notes,
        }),
      });

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
      <Textarea
        label="Notas de resolución"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Explica la decisión tomada..."
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          loading={loading}
          onClick={() => void submit("resolved")}
        >
          Resolver
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={loading}
          onClick={() => void submit("hidden")}
        >
          Ocultar reseña
        </Button>
      </div>
    </div>
  );
}