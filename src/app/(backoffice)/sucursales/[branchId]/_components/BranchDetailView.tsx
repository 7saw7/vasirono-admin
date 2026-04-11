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
        <p className="text-sm font-medium text-neutral-500">Sucursales</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          {data.name}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Vista consolidada del local: perfil, contactos, horarios, servicios,
          media, analítica y aforo.
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