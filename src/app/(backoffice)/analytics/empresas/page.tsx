import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { CompanyAnalyticsView } from "./_components/CompanyAnalyticsView";

export const dynamic = "force-dynamic";

export default async function CompanyAnalyticsPage() {
  await getBackofficeContext("analytics.read");
  return <CompanyAnalyticsView />;
}