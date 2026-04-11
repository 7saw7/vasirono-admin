"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type ClaimDecisionFormProps = {
  claimId: number;
  onSuccess?: () => void;
};

export function ClaimDecisionForm({
  claimId,
  onSuccess,
}: ClaimDecisionFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(decision: "approve" | "reject") {
    try {
      setIsSubmitting(true);
      setError("");

      const endpoint =
        decision === "approve"
          ? `/api/backoffice/claims/${claimId}/approve`
          : `/api/backoffice/claims/${claimId}/reject`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision,
          notes,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "No se pudo procesar la decisión.");
        return;
      }

      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 p-4">
      <p className="text-sm font-medium text-neutral-900">Decisión</p>

      <Textarea
        label="Notas internas"
        placeholder="Agrega contexto operativo para la decisión..."
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={isSubmitting}
          onClick={() => void handleAction("approve")}
        >
          Aprobar
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={isSubmitting}
          onClick={() => void handleAction("reject")}
        >
          Rechazar
        </Button>
      </div>
    </div>
  );
}