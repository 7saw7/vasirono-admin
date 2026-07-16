import { requireBackofficePage } from "@/lib/auth/page-guard";
import { BranchAnalyticsView } from "./_components/BranchAnalyticsView";

export const dynamic = "force-dynamic";

export default async function BranchAnalyticsPage() {
  await requireBackofficePage("analytics.read");
  return <BranchAnalyticsView />;
}