"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { SubscriptionFilterOption } from "@/features/backoffice/billing/types";
import type { Option } from "@/features/backoffice/shared/types";

type Props = { plans: SubscriptionFilterOption[]; statuses: SubscriptionFilterOption[]; companies: Option<number>[] };
type State = { kind: "idle" | "saving" | "success" | "error"; message?: string };
type CompanySearchState = { kind: "idle" | "loading" | "error"; message?: string };

async function readJson(url: string) {
  const response = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(String(payload?.error?.message ?? payload?.error ?? payload?.message ?? "No se pudo completar la consulta."));
  }
  return payload?.data ?? payload;
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(String(payload?.error?.message ?? payload?.error ?? payload?.message ?? "No se pudo completar la operación."));
  }
  return payload?.data ?? payload;
}

export function SubscriptionManagementPanel({ plans, statuses, companies }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [companyOptions, setCompanyOptions] = useState<Option<number>[]>(companies);
  const [companySearch, setCompanySearch] = useState("");
  const [companySearchState, setCompanySearchState] = useState<CompanySearchState>({ kind: "idle" });

  async function searchCompanies() {
    const query = companySearch.trim();
    if (query.length < 2) {
      setCompanySearchState({ kind: "error", message: "Escribe al menos 2 caracteres para buscar." });
      return;
    }

    setCompanySearchState({ kind: "loading" });
    try {
      const data = await readJson(`/api/backoffice/companies?search=${encodeURIComponent(query)}&pageSize=30`);
      const items = Array.isArray(data?.items) ? data.items : [];
      const nextOptions = items
        .map((item: unknown) => {
          if (!item || typeof item !== "object") return null;
          const record = item as { companyId?: unknown; name?: unknown };
          const companyId = Number(record.companyId);
          if (!Number.isInteger(companyId) || companyId <= 0) return null;
          const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : `Empresa ${companyId}`;
          return { value: companyId, label: `${name} (#${companyId})` };
        })
        .filter((option: Option<number> | null): option is Option<number> => option !== null);

      setCompanyOptions(nextOptions);
      setCompanySearchState({
        kind: "idle",
        message: nextOptions.length ? `${nextOptions.length} empresa(s) encontrada(s).` : "No se encontraron empresas con ese criterio.",
      });
    } catch (error) {
      setCompanySearchState({
        kind: "error",
        message: error instanceof Error ? error.message : "No se pudo buscar empresas.",
      });
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const startDate = String(form.get("startDate") ?? "").trim();
    const endDate = String(form.get("endDate") ?? "").trim();
    setState({ kind: "saving" });
    try {
      await postJson("/api/backoffice/subscriptions", {
        companyId: Number(form.get("companyId")),
        planId: Number(form.get("planId")),
        statusId: form.get("statusId") ? Number(form.get("statusId")) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        replaceActive: form.get("replaceActive") === "on",
        idempotencyKey: `admin-sub-${crypto.randomUUID()}`,
      });
      setState({ kind: "success", message: "Suscripción registrada correctamente." });
      formElement.reset();
      router.refresh();
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "No se pudo crear la suscripción." });
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.025]">
      <div>
        <h2 className="text-base font-bold text-slate-950 dark:text-white">Registrar suscripción administrativa</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">La operación es idempotente y puede reemplazar la suscripción activa de la empresa.</p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 md:col-span-2 xl:col-span-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              label="Buscar empresa"
              value={companySearch}
              onChange={(event) => setCompanySearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void searchCompanies();
                }
              }}
              placeholder="Nombre o identificador"
              hint="La búsqueda consulta todo el catálogo, no solo las primeras empresas cargadas."
            />
            <Button type="button" variant="secondary" loading={companySearchState.kind === "loading"} onClick={() => void searchCompanies()}>
              Buscar
            </Button>
          </div>
          {companySearchState.message ? (
            <p className={`text-xs ${companySearchState.kind === "error" ? "text-rose-600" : "text-slate-500 dark:text-slate-400"}`}>
              {companySearchState.message}
            </p>
          ) : null}
          <Select name="companyId" label="Empresa" placeholder="Selecciona empresa" options={companyOptions} required />
        </div>
        <Select name="planId" label="Plan" placeholder="Selecciona plan" options={plans} required />
        <Select name="statusId" label="Estado inicial" placeholder="Usar estado predeterminado" options={statuses} />
        <Input name="startDate" label="Inicio" type="date" />
        <Input name="endDate" label="Fin" type="date" />
        <label className="flex items-center gap-2 self-end pb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input name="replaceActive" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
          Reemplazar suscripción activa
        </label>
        <div className="self-end"><Button type="submit" loading={state.kind === "saving"}>Crear suscripción</Button></div>
      </div>
      {state.message ? <p className={`mt-3 text-xs ${state.kind === "error" ? "text-rose-600" : "text-emerald-600"}`}>{state.message}</p> : null}
    </form>
  );
}
