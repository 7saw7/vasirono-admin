"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { ClaimListItem } from "@/features/backoffice/claims/types";
import { formatDateTime } from "@/lib/utils/dates";
import { ClaimDecisionForm } from "./ClaimDecisionForm";
import { ClaimEvidencePreview } from "./ClaimEvidencePreview";

type ClaimReviewDrawerProps = {
  claim: ClaimListItem;
};

export function ClaimReviewDrawer({ claim }: ClaimReviewDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Revisar
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">Claim #{claim.claimRequestId}</p>
                <h2 className="mt-1 text-2xl font-semibold text-neutral-950">
                  {claim.companyName}
                </h2>
              </div>

              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>

            <div className="mt-3">
              <Link
                href={`/claims/${claim.claimRequestId}`}
                className="text-sm font-medium text-neutral-900 underline"
              >
                Abrir vista completa
              </Link>
            </div>

            <div className="mt-6 space-y-6">
              <section className="rounded-2xl border border-neutral-200 p-4">
                <p className="text-sm font-medium text-neutral-900">Resumen</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Solicitante" value={claim.claimantName} />
                  <Field label="Correo" value={claim.claimantEmail} />
                  <Field label="Estado" value={claim.statusName} />
                  <Field label="Enviado" value={formatDateTime(claim.submittedAt)} />
                  <Field label="Revisado" value={formatDateTime(claim.reviewedAt)} />
                  <Field
                    label="Verification flow"
                    value={claim.hasVerificationRequest ? "Sí" : "No"}
                  />
                </div>

                {claim.notes ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-neutral-900">Notas</p>
                    <p className="mt-2 text-sm text-neutral-600">{claim.notes}</p>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-neutral-200 p-4">
                <p className="mb-3 text-sm font-medium text-neutral-900">Evidencia</p>
                <ClaimEvidencePreview evidenceUrl={claim.evidenceUrl} />
              </section>

              <ClaimDecisionForm
                claimId={claim.claimRequestId}
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}