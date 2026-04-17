import {
  userDetailSchema,
  usersListFiltersSchema,
  usersListResultSchema,
} from "./schema";
import {
  mapUserDetailRow,
  mapUserListRow,
} from "./mapper";
import type { UsersListFilters } from "./types";
import {
  getUserBadgesQuery,
  getUserDetailQuery,
  getUserFavoritesQuery,
  getUserNotificationsQuery,
  getUserRecentViewsQuery,
  getUserReviewsQuery,
  getUserSessionsQuery,
  listUsersQuery,
} from "@/lib/db/queries/backoffice/users";

export async function getUsersList(input: UsersListFilters) {
  const filters = usersListFiltersSchema.parse(input);
  const result = await listUsersQuery(filters);

  return usersListResultSchema.parse({
    items: result.rows.map(mapUserListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getUserDetail(userId: string) {
  const base = await getUserDetailQuery(userId);
  if (!base) return null;

  const [sessions, notifications, favorites, recentViews, badges, reviews] =
    await Promise.all([
      getUserSessionsQuery(userId),
      getUserNotificationsQuery(userId),
      getUserFavoritesQuery(userId),
      getUserRecentViewsQuery(userId),
      getUserBadgesQuery(userId),
      getUserReviewsQuery(userId),
    ]);

  return userDetailSchema.parse(
    mapUserDetailRow(base, {
      sessions,
      notifications,
      favorites,
      recentViews,
      badges,
      reviews,
    })
  );
}