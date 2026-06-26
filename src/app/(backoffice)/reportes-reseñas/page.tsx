import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

export default function AccentedReviewReportsAliasPage() {
  redirect(ROUTES.BACKOFFICE_REVIEW_REPORTS);
}
