import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { UserSessionItem } from "@/features/backoffice/users/types";

type UserSessionSummaryProps = {
  sessions: UserSessionItem[];
};

export function UserSessionSummary({ sessions }: UserSessionSummaryProps) {
  return (
    <SectionCard title="Sesiones" description="Últimas sesiones del usuario.">
      {sessions.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay sesiones registradas.</p>
      ) : (
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <p className="text-sm font-medium text-neutral-900">
                Sesión #{session.id}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Creada: {formatDateTime(session.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}