import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { UserDetail } from "@/features/backoffice/users/types";

type UserProfilePanelProps = {
  data: UserDetail;
};

export function UserProfilePanel({ data }: UserProfilePanelProps) {
  return (
    <SectionCard title="Perfil" description="Datos base del usuario.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" value={data.name} />
        <Field label="Correo" value={data.email} />
        <Field label="Teléfono" value={data.phone ?? "—"} />
        <Field label="Rol" value={data.roleName} />
        <Field label="Creado" value={formatDateTime(data.createdAt)} />
        <Field label="Actualizado" value={formatDateTime(data.updatedAt)} />
      </div>
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}