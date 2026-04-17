import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { VerificationWhatsappItem } from "@/features/backoffice/verifications/types";

type VerificationWhatsappPanelProps = {
  items: VerificationWhatsappItem[];
};

function mapTone(status: string) {
  const code = status.toLowerCase();
  if (["verified"].includes(code)) return "success" as const;
  if (["pending", "sent"].includes(code)) return "warning" as const;
  if (["failed", "expired", "blocked", "cancelled"].includes(code)) {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function VerificationWhatsappPanel({
  items,
}: VerificationWhatsappPanelProps) {
  return (
    <SectionCard
      title="Whatsapp verification"
      description="Intentos OTP y estado de validación del teléfono público."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay verificaciones de WhatsApp registradas.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.whatsappVerificationId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.publicPhone}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Intentos: {item.attemptsCount}/{item.maxAttempts}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Verificado: {formatDateTime(item.verifiedAt)}
                  </p>
                </div>

                <StatusBadge
                  label={item.status}
                  tone={mapTone(item.status)}
                />
              </div>

              {item.failureReason ? (
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-600">
                  {item.failureReason}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}