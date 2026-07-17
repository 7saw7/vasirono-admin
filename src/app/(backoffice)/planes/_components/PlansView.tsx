import { PlansFilters } from "./PlansFilters";
import { PlansTable } from "./PlansTable";
import { PlanForm } from "./PlanForm";
import type { PlansDashboardData } from "@/features/backoffice/billing/types";

type PlansViewProps = { data: PlansDashboardData; canManage: boolean };

export function PlansView({ data, canManage }: PlansViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">Planes</h1>
        <p className="mt-2 text-sm text-neutral-500">Catálogo de planes existente y su adopción en suscripciones.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total planes" value={String(data.summary.totalPlans)} />
        <SummaryCard label="Con suscripciones" value={String(data.summary.plansWithSubscriptions)} />
        <SummaryCard label="Suscripciones ligadas" value={String(data.summary.totalSubscriptionsLinked)} />
        <SummaryCard label="Suscripciones activas" value={String(data.summary.activeSubscriptionsLinked)} />
      </div>
      {canManage ? <PlanForm /> : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Tu rol tiene acceso de consulta. La creación y modificación requieren <strong>plans.manage</strong>.
        </div>
      )}
      <PlansFilters />
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>Mostrando {data.plans.items.length} de {data.plans.total} planes</span>
        <span>Página {data.plans.page} · {data.plans.pageSize} por página</span>
      </div>
      <PlansTable data={data.plans} canManage={canManage} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><p className="text-sm text-neutral-500">{label}</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p></div>;
}
