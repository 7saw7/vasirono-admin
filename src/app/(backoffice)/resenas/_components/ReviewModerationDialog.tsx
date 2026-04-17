"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type ReviewModerationDialogProps = {
  mode: "hide" | "restore";
  isOpen: boolean;
  reviewId: number | null;
  isSubmitting?: boolean;
  feedback?: {
    type: "success" | "error";
    message: string;
  } | null;
  onClose: () => void;
  onSubmit: (payload: { reason?: string }) => Promise<void> | void;
};

export function ReviewModerationDialog({
  mode,
  isOpen,
  reviewId,
  isSubmitting = false,
  feedback = null,
  onClose,
  onSubmit,
}: ReviewModerationDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen, mode, reviewId]);

  if (!isOpen || reviewId === null) {
    return null;
  }

  const isHide = mode === "hide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">
            {isHide ? "Ocultar reseña" : "Restaurar reseña"}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            {isHide
              ? "Esta acción ocultará la reseña en la plataforma."
              : "Esta acción restaurará la visibilidad de la reseña."}
          </p>
        </div>

        <div className="mt-5">
          <Textarea
            name="reason"
            label={isHide ? "Motivo del ocultamiento" : "Observación (opcional)"}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={
              isHide
                ? "Explica por qué la reseña debe ocultarse..."
                : "Puedes registrar una observación de restauración..."
            }
          />
        </div>

        {feedback ? (
          <div
            className={
              feedback.type === "success"
                ? "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                : "mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            }
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            type="button"
            loading={isSubmitting}
            onClick={() =>
              void onSubmit(
                isHide
                  ? { reason }
                  : reason.trim()
                  ? { reason }
                  : {}
              )
            }
          >
            {isHide ? "Confirmar ocultamiento" : "Confirmar restauración"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}