"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";

type VerificationAssignmentPanelProps = {
  requestId: number;
  currentUserId: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
};

type ApiResponse = {
  ok: boolean;
  error?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function VerificationAssignmentPanel({
  requestId,
  currentUserId,
  assignedReviewerId,
  assignedReviewerName,
}: VerificationAssignmentPanelProps) {
  const router = useRouter();
  const [reviewerUserId, setReviewerUserId] = useState(
    assignedReviewerId ?? currentUserId
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function assign(userId: string) {
    const normalizedUserId = userId.trim();

    if (!UUID_PATTERN.test(normalizedUserId)) {
      setMessage(null);
      setError("Ingresa un UUID de revisor válido.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/backoffice/verifications/${requestId}/assign`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reviewerUserId: normalizedUserId }),
        }
      );
      const payload = (await response.json().catch(() => null)) as
        | ApiResponse
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error ?? "No se pudo asignar la solicitud."
        );
      }

      setReviewerUserId(normalizedUserId);
      setMessage("Revisor asignado correctamente.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo asignar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Asignación de revisión"
      description="Asigna la solicitud a un revisor antes de emitir una decisión."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <Input
          label="UUID del revisor"
          value={reviewerUserId}
          onChange={(event) => setReviewerUserId(event.target.value.trim())}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            loading={loading}
            onClick={() => void assign(currentUserId)}
          >
            Asignarme
          </Button>
          <Button
            type="button"
            loading={loading}
            disabled={!UUID_PATTERN.test(reviewerUserId)}
            onClick={() => void assign(reviewerUserId)}
          >
            Asignar revisor
          </Button>
        </div>
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        Asignación actual: {assignedReviewerName ?? assignedReviewerId ?? "Sin asignar"}
      </p>

      {message ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </SectionCard>
  );
}
