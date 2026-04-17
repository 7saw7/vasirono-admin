"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ReviewMediaPreview } from "./ReviewMediaPreview";
import { ReviewResponsePreview } from "./ReviewResponsePreview";
import { ReviewUsefulnessPanel } from "./ReviewUsefulnessPanel";
import type { ReviewDetail } from "@/features/backoffice/reviews/types";
import { formatDateTime } from "@/lib/utils/dates";

type ReviewDetailDrawerProps = {
  reviewId: number | null;
  open: boolean;
  onClose: () => void;
};

export function ReviewDetailDrawer({
  reviewId,
  open,
  onClose,
}: ReviewDetailDrawerProps) {
  const [data, setData] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !reviewId) return;

    let mounted = true;

    async function run() {
      try {
        setLoading(true);
        const response = await fetch(`/api/backoffice/reviews/${reviewId}`);
        const payload = (await response.json()) as {
          ok: boolean;
          data?: ReviewDetail;
        };

        if (mounted && payload.ok && payload.data) {
          setData(payload.data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void run();

    return () => {
      mounted = false;
    };
  }, [open, reviewId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Detalle de reseña</p>
            <h2 className="text-2xl font-semibold text-neutral-950">
              {reviewId ? `Review #${reviewId}` : "—"}
            </h2>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-neutral-500">Cargando...</div>
        ) : !data ? (
          <div className="mt-6 text-sm text-neutral-500">
            No se pudo cargar la reseña.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Usuario" value={data.userName} />
                <Field label="Correo" value={data.userEmail} />
                <Field label="Empresa" value={data.companyName} />
                <Field label="Sucursal" value={data.branchName} />
                <Field label="Rating" value={String(data.rating)} />
                <Field label="Fecha" value={formatDateTime(data.createdAt)} />
              </div>

              <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-700 whitespace-pre-wrap">
                {data.comment ?? "Sin comentario"}
              </div>
            </div>

            <ReviewMediaPreview media={data.media} />
            <ReviewResponsePreview response={data.response} />
            <ReviewUsefulnessPanel usefulness={data.usefulness} />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}