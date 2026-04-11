import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchDetailContact } from "@/features/backoffice/branches/types";

type BranchContactsPanelProps = {
  contacts: BranchDetailContact[];
};

export function BranchContactsPanel({ contacts }: BranchContactsPanelProps) {
  return (
    <SectionCard
      title="Contactos"
      description="Canales de contacto vinculados a la sucursal."
    >
      {contacts.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay contactos registrados.</p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <article
              key={contact.contactId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {contact.contactTypeName}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">{contact.value}</p>
                  {contact.label ? (
                    <p className="mt-1 text-xs text-neutral-500">{contact.label}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {contact.isPrimary ? (
                    <StatusBadge label="Principal" tone="info" />
                  ) : null}
                  <StatusBadge
                    label={contact.isPublic ? "Público" : "Privado"}
                    tone={contact.isPublic ? "success" : "neutral"}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}