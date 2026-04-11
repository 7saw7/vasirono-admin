import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import { formatText } from "@/lib/utils/formatters";
import type { BranchDetail } from "@/features/backoffice/branches/types";

type BranchProfilePanelProps = {
  branch: BranchDetail;
};

export function BranchProfilePanel({ branch }: BranchProfilePanelProps) {
  return (
    <SectionCard
      title="Perfil de sucursal"
      description="Información principal registrada para este local."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Sucursal" value={branch.name} />
        <Field label="Empresa" value={branch.companyName} />
        <Field label="Dirección" value={branch.address} />
        <Field label="Distrito" value={formatText(branch.districtName)} />
        <Field label="Correo" value={formatText(branch.email)} />
        <Field label="Teléfono" value={formatText(branch.phone)} />
        <Field label="Creada" value={formatDateTime(branch.createdAt)} />
        <Field label="Actualizada" value={formatDateTime(branch.updatedAt)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge
          label={branch.isActive ? "Activa" : "Inactiva"}
          tone={branch.isActive ? "success" : "danger"}
        />
        {branch.isMain ? <StatusBadge label="Principal" tone="info" /> : null}
      </div>

      {branch.description ? (
        <div className="mt-5 rounded-2xl border border-neutral-100 p-4">
          <p className="text-sm font-medium text-neutral-900">Descripción</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {branch.description}
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