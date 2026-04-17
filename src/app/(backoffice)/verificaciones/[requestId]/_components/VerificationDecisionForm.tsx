"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type VerificationDecisionFormProps = {
  requestId: number;
};

export function VerificationDecisionForm({
  requestId,
}: VerificationDecisionFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleDecision(decision: "approve" | "reject") {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(
        `/api/backoffice/verifications/${requestId}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision,
            notes,
          }),
        }
      );

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "No se pudo registrar la decisión.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-900">Decisión</p>

      <div className="mt-4">
        <Textarea
          label="Notas"
          placeholder="Añade contexto operativo para aprobar o rechazar..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          loading={isSubmitting}
          onClick={() => void handleDecision("approve")}
        >
          Aprobar
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={isSubmitting}
          onClick={() => void handleDecision("reject")}
        >
          Rechazar
        </Button>
      </div>
    </div>
  );
}