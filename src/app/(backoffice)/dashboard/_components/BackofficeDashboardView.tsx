import { GlobalKpiGrid } from "./GlobalKpiGrid";
import { PlatformHealthCard } from "./PlatformHealthCard";
import { VerificationQueueCard } from "./VerificationQueueCard";
import { ModerationQueueCard } from "./ModerationQueueCard";
import { ClaimsQueueCard } from "./ClaimsQueueCard";
import { RevenueSummaryCard } from "./RevenueSummaryCard";
import { RecentActivityFeed } from "./RecentActivityFeed";
import type { BackofficeDashboardData } from "@/features/backoffice/dashboard/types";

type BackofficeDashboardViewProps = {
  data: BackofficeDashboardData;
};

export function BackofficeDashboardView({
  data,
}: BackofficeDashboardViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Vista general del backoffice
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Estado agregado de operación, moderación, verificaciones, claims,
          pagos y actividad reciente.
        </p>
      </div>

      <GlobalKpiGrid kpis={data.kpis} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PlatformHealthCard items={data.platformHealth} />
        <RevenueSummaryCard data={data.revenueSummary} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <VerificationQueueCard data={data.verificationQueue} />
        <ModerationQueueCard data={data.moderationQueue} />
        <ClaimsQueueCard data={data.claimsQueue} />
      </div>

      <RecentActivityFeed items={data.recentActivity} />
    </div>
  );
}