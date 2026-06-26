import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

export default function AccentedReviewsAliasPage() {
  redirect(ROUTES.BACKOFFICE_REVIEWS);
}
