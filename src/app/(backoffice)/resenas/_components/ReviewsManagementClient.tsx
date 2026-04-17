"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewModerationDialog } from "./ReviewModerationDialog";
import type {
  ReviewListItem,
  ReviewsListResult,
} from "@/features/backoffice/reviews/types";

type Feedback =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

type ReviewsManagementClientProps = {
  data: ReviewsListResult;
  canModerate: boolean;
};

export function ReviewsManagementClient({
  data,
  canModerate,
}: ReviewsManagementClientProps) {
  const router = useRouter();
  const [selectedReview, setSelectedReview] = useState<ReviewListItem | null>(null);
  const [dialogMode, setDialogMode] = useState<"hide" | "restore" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function closeDialog() {
    setSelectedReview(null);
    setDialogMode(null);
    setFeedback(null);
  }

  async function handleSubmit(payload: { reason?: string }) {
    if (!selectedReview || !dialogMode) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const endpoint =
        dialogMode === "hide"
          ? `/api/backoffice/reviews/${selectedReview.reviewId}/hide`
          : `/api/backoffice/reviews/${selectedReview.reviewId}/restore`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "No se pudo completar la acción.");
      }

      setFeedback({
        type: "success",
        message:
          dialogMode === "hide"
            ? "La reseña fue ocultada correctamente."
            : "La reseña fue restaurada correctamente.",
      });

      router.refresh();

      setTimeout(() => {
        closeDialog();
      }, 500);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo completar la acción.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Reseñas
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Moderación y supervisión de reseñas registradas en la plataforma.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>
          Mostrando {data.items.length} de {data.total} reseñas
        </span>
        <span>
          Página {data.page} · {data.pageSize} por página
        </span>
      </div>

      <ReviewsTable
        data={data}
        canModerate={canModerate}
        onHide={(item) => {
          setSelectedReview(item);
          setDialogMode("hide");
          setFeedback(null);
        }}
        onRestore={(item) => {
          setSelectedReview(item);
          setDialogMode("restore");
          setFeedback(null);
        }}
      />

      <ReviewModerationDialog
        mode={dialogMode ?? "hide"}
        isOpen={Boolean(selectedReview && dialogMode)}
        reviewId={selectedReview?.reviewId ?? null}
        isSubmitting={isSubmitting}
        feedback={feedback}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}