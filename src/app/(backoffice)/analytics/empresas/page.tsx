import { requireBackofficePage } from "@/lib/auth/page-guard";
import { CompanyAnalyticsView } from "./_components/CompanyAnalyticsView";

export const dynamic = "force-dynamic";

export default async function CompanyAnalyticsPage() {
  await requireBackofficePage("analytics.read");
  return <CompanyAnalyticsView />;
}