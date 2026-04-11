import { SectionCard } from "@/components/ui/SectionCard";
import { formatDate } from "@/lib/utils/dates";
import type { CompanyDetailSubscription } from "@/features/backoffice/companies/types";

type CompanySubscriptionPanelProps = {
  subscription: CompanyDetailSubscription;
};

export function CompanySubscriptionPanel({
  subscription,
}: CompanySubscriptionPanelProps) {
  return (
    <SectionCard
      title="Suscripción"
      description="Última suscripción registrada para la empresa."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Suscripción"
          value={subscription.subscriptionId ? `#${subscription.subscriptionId}` : "—"}
        />
        <Field label="Plan" value={subscription.planName ?? "—"} />
        <Field label="Estado" value={subscription.statusName ?? "—"} />
        <Field label="Inicio" value={formatDate(subscription.startDate)} />
        <Field label="Fin" value={formatDate(subscription.endDate)} />
      </div>
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