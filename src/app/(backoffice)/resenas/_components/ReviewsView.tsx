import { ReviewsManagementClient } from "./ReviewsManagementClient";
import type { ReviewsListResult } from "@/features/backoffice/reviews/types";

type ReviewsViewProps = {
  data: ReviewsListResult;
  canModerate: boolean;
};

export function ReviewsView({ data, canModerate }: ReviewsViewProps) {
  return (
    <ReviewsManagementClient
      data={data}
      canModerate={canModerate}
    />
  );
}