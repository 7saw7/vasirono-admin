import { CompaniesTable } from "./CompaniesTable";
import { CompanyFilters } from "./CompanyFilters";
import type { CompanyListResult } from "@/features/backoffice/companies/types";

type CompaniesViewProps = {
  data: CompanyListResult;
};

export function CompaniesView({ data }: CompaniesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Empresas</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Gestión de empresas
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Administra el catálogo empresarial, su estado de verificación,
          suscripción y carga operativa asociada.
        </p>
      </div>

      <CompanyFilters />

      <CompaniesTable data={data} />
    </div>
  );
}