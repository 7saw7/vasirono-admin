"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type ReviewReportDecisionFormProps = {
  reportId: number;
};

type ApiResponse = {
  ok: boolean;
  error?: string;
};

export function ReviewReportDecisionForm({
  reportId,
}: ReviewReportDecisionFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "resolved" | "hidden" | "dismissed"
  >("resolved");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/backoffice/review-reports/${reportId}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            resolutionNotes: notes.trim() || undefined,
          }),
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | ApiResponse
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error ?? "No se pudo resolver el reporte."
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo resolver el reporte."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
      <Select
        label="Resolución"
        value={status}
        onChange={(event) =>
          setStatus(
            event.target.value as "resolved" | "hidden" | "dismissed"
          )
        }
        options={[
          { value: "resolved", label: "Resolver sin ocultar" },
          { value: "hidden", label: "Resolver y ocultar reseña" },
          { value: "dismissed", label: "Desestimar reporte" },
        ]}
      />

      <Textarea
        label="Notas de resolución"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Explica la decisión tomada..."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Button
        type="button"
        variant={status === "hidden" ? "danger" : "secondary"}
        loading={loading}
        onClick={() => void submit()}
      >
        Guardar resolución
      </Button>
    </div>
  );
}
