import { SectionCard } from "@/components/ui/SectionCard";
import type { BackofficeAnalyticsData } from "@/features/backoffice/analytics/types";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { TrendChart } from "@/components/charts/TrendChart";

type AnalyticsViewProps = {
  data: BackofficeAnalyticsData;
};

const funnelLabels: Record<string, string> = {
  profile_views: "Profile views",
  favorites_added: "Favoritos añadidos",
  promotion_opens: "Aperturas de promoción",
  contact_clicks: "Clicks de contacto",
  claim_submissions: "Claims enviados",
};

export function AnalyticsView({ data }: AnalyticsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Vista agregada de actividad, funnel y score usando datos reales del
          sistema.
        </p>
      </div>

      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Eventos" value={data.overview.totalEvents} />
        <KpiCard label="Búsquedas" value={data.overview.totalSearches} />
        <KpiCard label="Profile views" value={data.overview.totalProfileViews} />
        <KpiCard label="Contact clicks" value={data.overview.totalContactClicks} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Funnel" description="Embudo agregado filtrable">
          {data.funnel.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No hay datos para el rango seleccionado.
            </p>
          ) : (
            <div className="space-y-3">
              {data.funnel.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-neutral-100 p-4"
                >
                  <span className="text-sm text-neutral-600">
                    {funnelLabels[item.label] ?? item.label}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Top branches"
          description="Sucursales con mejor score actual"
        >
          {data.topBranches.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No hay sucursales para los filtros aplicados.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topBranches.map((item) => (
                <div
                  key={item.branchId}
                  className="rounded-2xl border border-neutral-100 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {item.branchName}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {item.companyName}
                      </p>
                    </div>

                    <div className="rounded-xl bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                      Score {item.finalScore}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <MiniMetric
                      label="Visitas 30d"
                      value={item.visits30d}
                    />
                    <MiniMetric
                      label="Reviews 90d"
                      value={item.reviews90d}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChart
          title="Branch score trend"
          description="Promedio diario del score de sucursales"
          data={data.branchScoreTrend}
        />
        <TrendChart
          title="Company score trend"
          description="Promedio diario del score de empresas"
          data={data.companyScoreTrend}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}