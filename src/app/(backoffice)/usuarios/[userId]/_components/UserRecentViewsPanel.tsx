import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { UserRecentViewItem } from "@/features/backoffice/users/types";

type UserRecentViewsPanelProps = {
  recentViews: UserRecentViewItem[];
};

export function UserRecentViewsPanel({
  recentViews,
}: UserRecentViewsPanelProps) {
  return (
    <SectionCard
      title="Vistas recientes"
      description="Lugares vistos recientemente por el usuario."
    >
      {recentViews.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay vistas recientes registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {recentViews.map((view) => (
            <div
              key={view.viewId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <p className="text-sm font-medium text-neutral-900">
                {view.companyName ?? "Empresa no disponible"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {view.branchName ?? "Sin sucursal"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {formatDateTime(view.viewedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}