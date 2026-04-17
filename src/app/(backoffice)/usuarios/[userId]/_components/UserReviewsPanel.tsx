import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { UserReviewItem } from "@/features/backoffice/users/types";

type UserReviewsPanelProps = {
  reviews: UserReviewItem[];
};

export function UserReviewsPanel({ reviews }: UserReviewsPanelProps) {
  return (
    <SectionCard title="Reviews" description="Últimas reseñas del usuario.">
      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay reviews registradas.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <p className="text-sm font-medium text-neutral-900">
                {review.branchName} · {review.rating}/5
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {review.comment ?? "Sin comentario"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {formatDateTime(review.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}