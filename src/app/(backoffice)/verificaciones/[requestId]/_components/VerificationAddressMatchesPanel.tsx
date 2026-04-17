import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNumber } from "@/lib/utils/numbers";
import type { VerificationAddressMatch } from "@/features/backoffice/verifications/types";

type VerificationAddressMatchesPanelProps = {
  items: VerificationAddressMatch[];
};

export function VerificationAddressMatchesPanel({
  items,
}: VerificationAddressMatchesPanelProps) {
  return (
    <SectionCard
      title="Validación de dirección"
      description="Comparación entre dirección declarada, extraída y sucursal."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay validaciones de dirección registradas.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.addressVerificationId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Fuente: {item.sourceType}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Distancia:{" "}
                    {item.distanceMeters === null
                      ? "—"
                      : `${formatNumber(item.distanceMeters)} m`}
                  </p>
                </div>

                <StatusBadge
                  label={item.matched ? "Match" : "Sin match"}
                  tone={item.matched ? "success" : "warning"}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Declarada" value={item.declaredAddress ?? "—"} />
                <Field label="Sucursal" value={item.branchAddress ?? "—"} />
                <Field label="Extraída" value={item.extractedAddress ?? "—"} />
              </div>

              {item.notes ? (
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-600">
                  {item.notes}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm text-neutral-900">{value}</p>
    </div>
  );
}