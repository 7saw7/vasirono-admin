import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { RecentActivityItem } from "@/features/backoffice/dashboard/types";

type RecentActivityFeedProps = {
  items: RecentActivityItem[];
};

export function RecentActivityFeed({
  items,
}: RecentActivityFeedProps) {
  return (
    <SectionCard
      title="Actividad reciente"
      description="Últimos movimientos relevantes detectados por el backoffice."
    >
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aún no hay actividad reciente para mostrar.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {item.description}
                  </p>
                </div>

                <span className="whitespace-nowrap text-xs text-neutral-400">
                  {formatDateTime(item.occurredAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}