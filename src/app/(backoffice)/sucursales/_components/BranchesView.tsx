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
        <p className="text-sm font-medium text-neutral-500">Sucursales</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Gestión de sucursales
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Administra locales publicados, estructura operativa, señales analíticas
          y estado general por sucursal.
        </p>
      </div>

      <BranchFilters />

      <BranchesTable data={data} />
    </div>
  );
}