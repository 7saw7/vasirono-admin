import { BranchAforoPanel } from "./BranchAforoPanel";
import { BranchAnalyticsPanel } from "./BranchAnalyticsPanel";
import { BranchContactsPanel } from "./BranchContactsPanel";
import { BranchMediaPanel } from "./BranchMediaPanel";
import { BranchProfilePanel } from "./BranchProfilePanel";
import { BranchSchedulesPanel } from "./BranchSchedulesPanel";
import { BranchServicesPanel } from "./BranchServicesPanel";
import type { BranchDetail } from "@/features/backoffice/branches/types";

type BranchDetailViewProps = {
  data: BranchDetail;
};

export function BranchDetailView({ data }: BranchDetailViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-neutral-500">Sucursales</p>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-600 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">Solo lectura</span>
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          {data.name}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Vista consolidada del local: perfil, contactos, horarios, servicios,
          media, analítica y aforo. Esta vista administrativa es de auditoría.
        </p>
      </div>

      <BranchProfilePanel branch={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <BranchContactsPanel contacts={data.contacts} />
        <BranchSchedulesPanel schedules={data.schedules} />
      </div>

      <BranchServicesPanel services={data.services} />
      <BranchMediaPanel media={data.media} />

      <div className="grid gap-6 xl:grid-cols-2">
        <BranchAnalyticsPanel analytics={data.analytics} />
        <BranchAforoPanel reports={data.aforo} />
      </div>
    </div>
  );
}