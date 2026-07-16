import { BranchFilters } from "./BranchFilters";
import { BranchesTable } from "./BranchesTable";
import type { BranchListResult } from "@/features/backoffice/branches/types";

type BranchesViewProps = {
  data: BranchListResult;
};

export function BranchesView({ data }: BranchesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-neutral-500">Sucursales</p>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-600 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">Modo auditoría</span>
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Gestión de sucursales
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Consulta locales publicados, estructura operativa, señales analíticas
          y estado general por sucursal. La edición continúa en el panel empresarial.
        </p>
      </div>

      <BranchFilters />

      <BranchesTable data={data} />
    </div>
  );
}