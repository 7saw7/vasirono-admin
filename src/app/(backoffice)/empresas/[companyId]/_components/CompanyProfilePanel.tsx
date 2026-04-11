import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import { formatText } from "@/lib/utils/formatters";
import type { CompanyDetail } from "@/features/backoffice/companies/types";

type CompanyProfilePanelProps = {
  company: CompanyDetail;
};

export function CompanyProfilePanel({ company }: CompanyProfilePanelProps) {
  return (
    <SectionCard
      title="Perfil de empresa"
      description="Información principal registrada en la plataforma."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" value={company.name} />
        <Field label="Correo" value={formatText(company.email)} />
        <Field label="Teléfono" value={formatText(company.phone)} />
        <Field label="Sitio web" value={formatText(company.website)} />
        <Field label="Dirección" value={formatText(company.address)} />
        <Field label="Estado verificación" value={company.verificationStatus} />
        <Field label="Creada" value={formatDateTime(company.createdAt)} />
        <Field label="Actualizada" value={formatDateTime(company.updatedAt)} />
      </div>

      {company.description ? (
        <div className="mt-5 rounded-2xl border border-neutral-100 p-4">
          <p className="text-sm font-medium text-neutral-900">Descripción</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {company.description}
          </p>
        </div>
      ) : null}
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}