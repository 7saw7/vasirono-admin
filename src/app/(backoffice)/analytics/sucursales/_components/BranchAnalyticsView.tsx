"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/utils/formatters";
import { formatNumber } from "@/lib/utils/numbers";
import { BranchScoreHistoryChart } from "./BranchScoreHistoryChart";
import { BranchScoreTable } from "./BranchScoreTable";
import { BranchSourceBreakdownTable } from "./BranchSourceBreakdownTable";

type BranchScoreItem = {
  branchId: number;
  branchName: string;
  companyId: number;
  companyName: string;
  districtName: string | null;
  finalScore: number;
  popularityScore: number;
  engagementScore: number;
  conversionScore: number;
  trustScore: number;
  freshnessScore: number;
  visits30d: number;
  favorites30d: number;
  contactClicks30d: number;
  reviews90d: number;
  avgRating90d: number;
  calculatedAt: string | null;
};

type SeriesPoint = {
  label: string;
  value: number;
};

type SourceBreakdownItem = {
  source: string;
  visitsCount: number;
  favoritesCount: number;
  contactClicks: number;
  reviewsCount: number;
};

type BranchAnalyticsResponse = {
  items: BranchScoreItem[];
  page: number;
  pageSize: number;
  total: number;
  history: SeriesPoint[];
  sources: SourceBreakdownItem[];
  summary: {
    totalBranches: number;
    averageScore: number;
    lastCalculatedAt: string | null;
  };
};

type FiltersState = {
  search: string;
  companyId: string;
  branchId: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
};

const DEFAULT_FILTERS: FiltersState = {
  search: "",
  companyId: "",
  branchId: "",
  from: "",
  to: "",
  page: 1,
  pageSize: 10,
};

export function BranchAnalyticsView() {
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [data, setData] = useState<BranchAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.companyId.trim()) params.set("companyId", filters.companyId.trim());
    if (filters.branchId.trim()) params.set("branchId", filters.branchId.trim());
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    params.set("page", String(filters.page));
    params.set("pageSize", String(filters.pageSize));

    return params.toString();
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `/api/backoffice/analytics/branches?${queryString}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const payload = (await response.json()) as {
          ok: boolean;
          data?: BranchAnalyticsResponse;
          error?: string;
        };

        if (!response.ok || !payload.ok || !payload.data) {
          throw new Error(payload.error ?? "No se pudieron obtener los analytics de sucursales.");
        }

        if (!cancelled) {
          setData(payload.data);
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(
            err instanceof Error
              ? err.message
              : "Ocurrió un error al cargar el analytics de sucursales."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [queryString]);

  function updateField<K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice / Analytics</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Analytics de sucursales
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Ranking, tendencia histórica y desglose de fuentes por sucursal.
        </p>
      </div>

      <SectionCard
        title="Filtros"
        description="Filtra por empresa, sucursal o rango de fechas."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Input
            label="Buscar"
            placeholder="Sucursal o empresa"
            value={filters.search}
            onChange={(event) => updateField("search", event.target.value)}
          />
          <Input
            label="Company ID"
            placeholder="Ej. 10"
            value={filters.companyId}
            onChange={(event) => updateField("companyId", event.target.value)}
          />
          <Input
            label="Branch ID"
            placeholder="Ej. 205"
            value={filters.branchId}
            onChange={(event) => updateField("branchId", event.target.value)}
          />
          <Input
            label="Desde"
            type="date"
            value={filters.from}
            onChange={(event) => updateField("from", event.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={filters.to}
            onChange={(event) => updateField("to", event.target.value)}
          />
          <Input
            label="Page size"
            type="number"
            min={1}
            max={100}
            value={String(filters.pageSize)}
            onChange={(event) =>
              updateField("pageSize", Math.max(1, Number(event.target.value || 10)))
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={handleReset}>
            Limpiar filtros
          </Button>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Sucursales con score"
          value={data?.summary.totalBranches ?? 0}
          helper="Registros actuales en analytics_branch_scores"
          loading={isLoading}
        />
        <MetricCard
          label="Score promedio"
          value={data?.summary.averageScore ?? 0}
          helper="Promedio del final_score"
          loading={isLoading}
        />
        <MetricCard
          label="Último cálculo"
          value={data?.summary.lastCalculatedAt ? 1 : 0}
          helper={
            data?.summary.lastCalculatedAt
              ? formatDateTime(data.summary.lastCalculatedAt)
              : "—"
          }
          loading={isLoading}
          formatAsBooleanLike
        />
      </div>

      <BranchScoreHistoryChart data={data?.history ?? []} />

      <BranchSourceBreakdownTable rows={data?.sources ?? []} loading={isLoading} />

      <BranchScoreTable rows={data?.items ?? []} loading={isLoading} />

      {data ? (
        <SectionCard>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={(page) => updateField("page", page)}
          />
        </SectionCard>
      ) : null}

      {!isLoading && !error && data && data.items.length === 0 ? (
        <EmptyState
          title="No hay sucursales para los filtros aplicados"
          description="Prueba quitando filtros o usando otro rango de fechas."
        />
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  loading,
  formatAsBooleanLike = false,
}: {
  label: string;
  value: number;
  helper: string;
  loading: boolean;
  formatAsBooleanLike?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">
        {loading ? "Cargando..." : formatAsBooleanLike ? (value ? "Sí" : "—") : formatNumber(value)}
      </p>
      <p className="mt-2 text-xs text-neutral-500">{helper}</p>
    </div>
  );
}