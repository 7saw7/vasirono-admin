import { SectionCard } from "@/components/ui/SectionCard";
import type { UserFavoriteBranchItem } from "@/features/backoffice/users/types";

type UserFavoritesPanelProps = {
  favorites: UserFavoriteBranchItem[];
};

export function UserFavoritesPanel({ favorites }: UserFavoritesPanelProps) {
  return (
    <SectionCard title="Favoritos" description="Sucursales favoritas del usuario.">
      {favorites.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay favoritos registrados.</p>
      ) : (
        <div className="space-y-3">
          {favorites.map((favorite) => (
            <div
              key={`${favorite.branchId}-${favorite.createdAt}`}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <p className="text-sm font-medium text-neutral-900">
                {favorite.branchName}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {favorite.companyName}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}