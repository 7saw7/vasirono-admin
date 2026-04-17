import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationPublicContact } from "@/features/backoffice/verifications/types";

type VerificationPublicContactsPanelProps = {
  items: VerificationPublicContact[];
};

export function VerificationPublicContactsPanel({
  items,
}: VerificationPublicContactsPanelProps) {
  return (
    <SectionCard
      title="Contactos públicos"
      description="Señales encontradas en WhatsApp, teléfono, web o redes."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay validaciones de contacto público.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.publicContactVerificationId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.contactLabel ?? item.contactSource}
                  </p>
                  <p className="mt-1 break-all text-sm text-neutral-600">
                    {item.contactValue}
                  </p>
                  {item.normalizedContactValue ? (
                    <p className="mt-1 break-all text-xs text-neutral-400">
                      {item.normalizedContactValue}
                    </p>
                  ) : null}
                </div>

                <StatusBadge
                  label={
                    item.matchedWithBranchContact ? "Match branch" : "Sin match"
                  }
                  tone={item.matchedWithBranchContact ? "success" : "warning"}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}