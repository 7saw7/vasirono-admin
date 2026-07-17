"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import type { SubscriptionFilterOption, SubscriptionsListResult } from "@/features/backoffice/billing/types";

type Props = { data: SubscriptionsListResult; canManage: boolean; plans: SubscriptionFilterOption[]; statuses: SubscriptionFilterOption[] };
type Busy = { id: number; action: string } | null;

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(date);
}

async function request(url: string, method: "PATCH" | "POST", body: unknown) {
  const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) throw new Error(String(payload?.error?.message ?? payload?.error ?? payload?.message ?? "No se pudo actualizar."));
}

export function SubscriptionsTable({ data, canManage, plans, statuses }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<string | null>(null);
  if (data.items.length === 0) return <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">No se encontraron suscripciones con los filtros aplicados.</div>;

  async function changePlan(id: number, planId: number) {
    if (!planId) return;
    if (!window.confirm("¿Confirmas el cambio de plan de esta suscripción?")) return;
    setBusy({ id, action: "plan" }); setMessage(null);
    try { await request(`/api/backoffice/subscriptions/${id}/plan`, "PATCH", { planId }); setMessage("Plan actualizado."); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo cambiar el plan."); }
    finally { setBusy(null); }
  }
  async function changeStatus(id: number, statusId: number) {
    if (!statusId) return;
    if (!window.confirm("¿Confirmas el cambio de estado? Esta acción queda registrada en el historial.")) return;
    setBusy({ id, action: "status" }); setMessage(null);
    try { await request(`/api/backoffice/subscriptions/${id}/status`, "PATCH", { statusId }); setMessage("Estado actualizado."); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo cambiar el estado."); }
    finally { setBusy(null); }
  }
  async function cancel(id: number) {
    if (!window.confirm("¿Cancelar esta suscripción? La operación no debe usarse para simular cobros de una pasarela.")) return;
    setBusy({ id, action: "cancel" }); setMessage(null);
    try { await request(`/api/backoffice/subscriptions/${id}/cancel`, "POST", {}); setMessage("Suscripción cancelada."); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo cancelar."); }
    finally { setBusy(null); }
  }

  return <div className="space-y-3">
    {message ? <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">{message}</p> : null}
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-neutral-200">
      <thead className="bg-neutral-50"><tr>{["Suscripción","Empresa","Plan","Estado","Inicio","Fin",...(canManage?["Administrar"]:[])].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-neutral-100 bg-white">{data.items.map(item=><tr key={item.id} className="align-top hover:bg-neutral-50">
        <td className="px-4 py-4 text-sm font-medium text-neutral-900">#{item.id}</td><td className="px-4 py-4 text-sm text-neutral-700">{item.companyName}</td><td className="px-4 py-4 text-sm font-medium text-neutral-900">{item.planName}</td><td className="px-4 py-4"><SubscriptionStatusBadge statusName={item.statusName}/></td><td className="px-4 py-4 text-sm text-neutral-700">{formatDate(item.startDate)}</td><td className="px-4 py-4 text-sm text-neutral-700">{formatDate(item.endDate)}</td>
        {canManage ? <td className="min-w-[330px] px-4 py-3"><div className="grid gap-2 sm:grid-cols-2">
          <select aria-label="Cambiar plan" defaultValue="" onChange={e=>{const v=Number(e.target.value); e.currentTarget.value=""; void changePlan(item.id,v)}} disabled={busy?.id===item.id} className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs"><option value="">Cambiar plan…</option>{plans.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <select aria-label="Cambiar estado" defaultValue="" onChange={e=>{const v=Number(e.target.value); e.currentTarget.value=""; void changeStatus(item.id,v)}} disabled={busy?.id===item.id} className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs"><option value="">Cambiar estado…</option>{statuses.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <Button type="button" variant="danger" size="sm" className="sm:col-span-2" loading={busy?.id===item.id && busy.action==="cancel"} onClick={()=>void cancel(item.id)}>Cancelar suscripción</Button>
        </div></td>:null}
      </tr>)}</tbody>
    </table></div></div>
  </div>;
}
