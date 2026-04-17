import { UserProfilePanel } from "./UserProfilePanel";
import { UserSessionsPanel } from "./UserSessionsPanel";
import { UserNotificationsPanel } from "./UserNotificationsPanel";
import { UserFavoritesPanel } from "./UserFavoritesPanel";
import { UserRecentViewsPanel } from "./UserRecentViewsPanel";
import { UserReviewsPanel } from "./UserReviewsPanel";
import { UserBadgesPanel } from "../../_components/UserBadgesPanel";
import type { UserDetail } from "@/features/backoffice/users/types";

type UserDetailViewProps = {
  data: UserDetail;
};

export function UserDetailView({ data }: UserDetailViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Usuarios</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          {data.name}
        </h1>
      </div>

      <UserProfilePanel data={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <UserSessionsPanel sessions={data.sessions} />
        <UserNotificationsPanel notifications={data.notifications} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <UserFavoritesPanel favorites={data.favorites} />
        <UserRecentViewsPanel recentViews={data.recentViews} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <UserBadgesPanel badges={data.badges} />
        <UserReviewsPanel reviews={data.reviews} />
      </div>
    </div>
  );
}