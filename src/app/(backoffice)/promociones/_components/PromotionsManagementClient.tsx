import { PromotionsFilters } from "./PromotionsFilters";
import { PromotionsTable } from "./PromotionsTable";
import { PromotionsPagination } from "./PromotionsPagination";
import type { PromotionsDashboardData } from "@/features/backoffice/promotions/types";

type PromotionsManagementClientProps = {
  data: PromotionsDashboardData;
  canModerate: boolean;
  canUpdateStatus: boolean;
};

export function PromotionsManagementClient({
  data,
  canModerate,
  canUpdateStatus,
}: PromotionsManagementClientProps) {
  const canAct = canModerate || canUpdateStatus;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Promociones
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Moderación, estado operativo y trazabilidad de promociones creadas por las empresas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total" value={data.summary.totalPromotions} />
        <SummaryCard label="Pendientes de revisión" value={data.summary.pendingReviewPromotions} />
        <SummaryCard label="Aprobadas" value={data.summary.approvedPromotions} />
        <SummaryCard label="Pausadas" value={data.summary.pausedPromotions} />
        <SummaryCard label="Rechazadas" value={data.summary.rejectedPromotions} />
        <SummaryCard label="Canjes emitidos" value={data.summary.issuedRedemptions} />
        <SummaryCard label="Canjes redimidos" value={data.summary.redeemedRedemptions} />
      </div>

      <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-400/15 dark:bg-indigo-400/[0.07] dark:text-indigo-200">
        Las promociones se crean y editan desde el Panel Empresas. El Web Admin únicamente revisa, aprueba, rechaza, solicita cambios, pausa o reactiva.
      </div>

      <PromotionsFilters />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>
          Mostrando {data.promotions.items.length} de {data.promotions.total} promociones
        </span>
        <span>
          Página {data.promotions.page} · {data.promotions.pageSize} por página
        </span>
      </div>

      <PromotionsTable data={data.promotions} showActions={canAct} />
      <PromotionsPagination
        page={data.promotions.page}
        pageSize={data.promotions.pageSize}
        total={data.promotions.total}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/[0.075] dark:bg-[#101620]">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
