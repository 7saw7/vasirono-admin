import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { BranchAnalyticsView } from "./_components/BranchAnalyticsView";

export const dynamic = "force-dynamic";

export default async function BranchAnalyticsPage() {
  await getBackofficeContext("analytics.read");
  return <BranchAnalyticsView />;
}