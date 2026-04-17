import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { VerificationDetail } from "@/features/backoffice/verifications/types";

type VerificationRequestHeaderProps = {
  data: VerificationDetail;
};

function mapTone(statusCode: string) {
  if (["approved", "verified", "completed"].includes(statusCode)) {
    return "success" as const;
  }
  if (["pending", "submitted", "in_review", "under_review", "assigned"].includes(statusCode)) {
    return "warning" as const;
  }
  if (["rejected", "failed", "cancelled"].includes(statusCode)) {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function VerificationRequestHeader({
  data,
}: VerificationRequestHeaderProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">Verificaciones</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
            Request #{data.verificationRequestId}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Empresa:{" "}
            <Link
              href={`/empresas/${data.companyId}`}
              className="font-medium text-neutral-900 underline"
            >
              {data.companyName}
            </Link>
          </p>
        </div>

        <StatusBadge
          label={data.statusName}
          tone={mapTone(data.statusCode)}
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Nivel" value={data.verificationLevel ?? "—"} />
        <Field label="Requester" value={data.requestedByName} />
        <Field label="Reviewer" value={data.assignedReviewerName ?? "Sin asignar"} />
        <Field
          label="Claim relacionado"
          value={data.claimRequestId ? `#${data.claimRequestId}` : "No"}
        />
        <Field label="Iniciado" value={formatDateTime(data.startedAt)} />
        <Field label="Enviado" value={formatDateTime(data.submittedAt)} />
        <Field label="Revisado" value={formatDateTime(data.reviewedAt)} />
        <Field label="Completado" value={formatDateTime(data.completedAt)} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}