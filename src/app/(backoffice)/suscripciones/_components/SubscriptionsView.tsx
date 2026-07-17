import { SubscriptionFilters } from "./SubscriptionFilters";
import { SubscriptionsTable } from "./SubscriptionsTable";
import { SubscriptionManagementPanel } from "./SubscriptionManagementPanel";
import type { SubscriptionFilterOption, SubscriptionsDashboardData } from "@/features/backoffice/billing/types";
import type { Option } from "@/features/backoffice/shared/types";

type Props = { data: SubscriptionsDashboardData; canManage: boolean; plans: SubscriptionFilterOption[]; statuses: SubscriptionFilterOption[]; companies: Option<number>[] };
export function SubscriptionsView({ data, canManage, plans, statuses, companies }: Props) {
  const meta = { plans, statuses };
  return <div className="space-y-6">
    <div><p className="text-sm font-medium text-neutral-500">Backoffice</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">Suscripciones</h1><p className="mt-2 text-sm text-neutral-500">Seguimiento y administración controlada de planes contratados, vigencia y estado por empresa.</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Total suscripciones" value={String(data.summary.totalSubscriptions)}/><SummaryCard label="Activas" value={String(data.summary.activeSubscriptions)}/><SummaryCard label="Inactivas" value={String(data.summary.inactiveSubscriptions)}/><SummaryCard label="Por vencer" value={String(data.summary.expiringSoonSubscriptions)}/></div>
    {canManage ? <SubscriptionManagementPanel plans={plans} statuses={statuses} companies={companies}/> : <ReadOnlyNotice />}
    <SubscriptionFilters meta={meta}/>
    <div className="flex items-center justify-between text-sm text-neutral-500"><span>Mostrando {data.subscriptions.items.length} de {data.subscriptions.total} suscripciones</span><span>Página {data.subscriptions.page} · {data.subscriptions.pageSize} por página</span></div>
    <SubscriptionsTable data={data.subscriptions} canManage={canManage} plans={plans} statuses={statuses}/>
  </div>;
}
function SummaryCard({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><p className="text-sm text-neutral-500">{label}</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p></div>}
function ReadOnlyNotice(){return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Tu rol puede consultar suscripciones, pero no crearlas, cancelar ni cambiar plan o estado.</div>}
