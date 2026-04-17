"use client";

import { useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import { ReviewReportDecisionForm } from "./ReviewReportDecisionForm";
import { ReviewReportFilters } from "./ReviewReportFilters";
import { ReviewReportsTable } from "./ReviewReportsTable";
import type {
  ReviewReportListItem,
  ReviewReportListResult,
} from "@/features/backoffice/review-reports/types";

type ReviewReportsViewProps = {
  data: ReviewReportListResult;
};

export function ReviewReportsView({ data }: ReviewReportsViewProps) {
  const [selected, setSelected] = useState<ReviewReportListItem | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Moderación</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Reportes de reseñas
        </h1>
      </div>

      <ReviewReportFilters />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <ReviewReportsTable data={data} onSelect={setSelected} />

        <SectionCard
          title="Detalle rápido"
          description="Selecciona un reporte para resolverlo."
        >
          {!selected ? (
            <p className="text-sm text-neutral-500">
              Aún no has seleccionado ningún reporte.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-100 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  Reporte #{selected.reportId}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Empresa: {selected.companyName}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Reporter: {selected.reporterName}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Fecha: {formatDateTime(selected.createdAt)}
                </p>
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-700">
                  {selected.details ?? selected.reason ?? "Sin detalle adicional"}
                </div>
              </div>

              <ReviewReportDecisionForm reportId={selected.reportId} />
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}