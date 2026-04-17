"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type ReviewReportItem = {
  reportId: number;
  reviewId: number;
  userName: string;
  companyName: string;
  reason: string | null;
  details: string | null;
  statusName: string;
  createdAt: string;
};

type ReviewReportsManagementClientProps = {
  items: ReviewReportItem[];
  canResolve: boolean;
};

export function ReviewReportsManagementClient({
  items,
  canResolve,
}: ReviewReportsManagementClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ReviewReportItem | null>(null);
  const [resolution, setResolution] = useState<"resolved" | "dismissed">("resolved");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleResolve() {
    if (!selected) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/backoffice/review-reports/${selected.reportId}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resolution,
            resolutionNotes: notes.trim() ? notes.trim() : null,
          }),
        }
      );

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "No se pudo resolver el reporte.");
      }

      setFeedback("Reporte resuelto correctamente.");
      router.refresh();

      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        setNotes("");
      }, 500);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo resolver el reporte."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Reportes de reseñas
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Atención y resolución de denuncias realizadas por usuarios.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Reporte
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Empresa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Motivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Estado
                </th>
                {canResolve ? (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Acción
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 bg-white">
              {items.map((item) => (
                <tr key={item.reportId} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    <div>
                      <p className="font-medium text-neutral-900">
                        #{item.reportId} · review #{item.reviewId}
                      </p>
                      <p className="text-xs text-neutral-500">{item.userName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {item.companyName}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    <div>
                      <p>{item.reason ?? "Sin motivo"}</p>
                      {item.details ? (
                        <p className="mt-1 text-xs text-neutral-500">
                          {item.details}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {item.statusName}
                  </td>
                  {canResolve ? (
                    <td className="px-4 py-4 text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setSelected(item);
                          setResolution("resolved");
                          setNotes("");
                          setFeedback(null);
                        }}
                      >
                        Resolver
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Resolver reporte #{selected.reportId}
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-neutral-700">Resultado</span>
              <select
                value={resolution}
                onChange={(event) =>
                  setResolution(event.target.value as "resolved" | "dismissed")
                }
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none ring-0 focus:border-neutral-500"
              >
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <Textarea
              name="resolutionNotes"
              label="Notas"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Explica la decisión tomada..."
            />
          </div>

          {feedback ? (
            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              {feedback}
            </div>
          ) : null}

          <div className="mt-6 flex gap-2">
            <Button
              type="button"
              loading={isSubmitting}
              onClick={() => void handleResolve()}
            >
              Guardar resolución
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelected(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}