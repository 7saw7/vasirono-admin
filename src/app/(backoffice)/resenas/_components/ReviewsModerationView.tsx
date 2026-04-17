"use client";

import { useState } from "react";
import { ReviewFilters } from "./ReviewFilters";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewDetailDrawer } from "./ReviewDetailDrawer";
import type { ReviewsListResult } from "@/features/backoffice/reviews/types";

type ReviewsModerationViewProps = {
  data: ReviewsListResult;
};

export function ReviewsModerationView({
  data,
}: ReviewsModerationViewProps) {
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Moderación</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Reseñas
        </h1>
      </div>

      <ReviewFilters />
      <ReviewsTable data={data} onOpenDetail={setSelectedReviewId} />

      <ReviewDetailDrawer
        reviewId={selectedReviewId}
        open={selectedReviewId !== null}
        onClose={() => setSelectedReviewId(null)}
      />
    </div>
  );
}