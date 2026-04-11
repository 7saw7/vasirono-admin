import { BackofficeDashboardView } from "./_components/BackofficeDashboardView";
import { getBackofficeDashboardData } from "@/features/backoffice/dashboard/service";

export const dynamic = "force-dynamic";

export default async function BackofficeDashboardPage() {
  const data = await getBackofficeDashboardData();

  return <BackofficeDashboardView data={data} />;
}