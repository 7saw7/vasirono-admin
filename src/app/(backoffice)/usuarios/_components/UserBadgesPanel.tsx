import { SectionCard } from "@/components/ui/SectionCard";
import type { UserBadgeItem } from "@/features/backoffice/users/types";

type UserBadgesPanelProps = {
  badges: UserBadgeItem[];
};

export function UserBadgesPanel({ badges }: UserBadgesPanelProps) {
  return (
    <SectionCard title="Badges" description="Reconocimientos del usuario.">
      {badges.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay badges registrados.</p>
      ) : (
        <div className="space-y-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <p className="text-sm font-medium text-neutral-900">
                {badge.badgeName}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Puntos: {badge.points}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}