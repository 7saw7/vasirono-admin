import { CompanyAuditPanel } from "./CompanyAuditPanel";
import { CompanyBranchesTable } from "./CompanyBranchesTable";
import { CompanyClaimsPanel } from "./CompanyClaimsPanel";
import { CompanyMediaPanel } from "./CompanyMediaPanel";
import { CompanyPaymentsPanel } from "./CompanyPaymentsPanel";
import { CompanyProfilePanel } from "./CompanyProfilePanel";
import { CompanySubscriptionPanel } from "./CompanySubscriptionPanel";
import { CompanyVerificationPanel } from "./CompanyVerificationPanel";
import type { CompanyDetail } from "@/features/backoffice/companies/types";

type CompanyDetailViewProps = {
  data: CompanyDetail;
};

export function CompanyDetailView({ data }: CompanyDetailViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Empresas</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          {data.name}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Vista consolidada del perfil empresarial, sus locales, verificación,
          suscripción, pagos, claims y trazabilidad.
        </p>
      </div>

      <CompanyProfilePanel company={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <CompanyVerificationPanel verification={data.verification} />
        <CompanySubscriptionPanel subscription={data.subscription} />
      </div>

      <CompanyBranchesTable branches={data.branches} />
      <CompanyMediaPanel media={data.media} />

      <div className="grid gap-6 xl:grid-cols-2">
        <CompanyPaymentsPanel payments={data.payments} />
        <CompanyClaimsPanel claims={data.claims} />
      </div>

      <CompanyAuditPanel audit={data.audit} />
    </div>
  );
}