import type {
  UserBadgeItem,
  UserDetail,
  UserFavoriteBranchItem,
  UserListItem,
  UserNotificationItem,
  UserRecentViewItem,
  UserReviewItem,
  UserSessionItem,
} from "./types";

export type UserListRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role_name: string;
  verified: boolean | null;
  reviews_count: number | string | null;
  sessions_count: number | string | null;
  last_session_at: Date | string | null;
  created_at: Date | string;
};

export type UserDetailRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role_name: string;
  verified: boolean | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type UserSessionRow = {
  id: number | string;
  revoked: boolean | null;
  created_at: Date | string;
  updated_at: Date | string;
  expires_at: Date | string;
};

export type UserNotificationRow = {
  id: number | string;
  title: string | null;
  message: string | null;
  read: boolean | null;
  created_at: Date | string;
};

export type UserFavoriteRow = {
  branch_id: number | string;
  branch_name: string;
  company_name: string;
  created_at: Date | string;
};

export type UserRecentViewRow = {
  view_id: number | string;
  company_name: string | null;
  branch_name: string | null;
  viewed_at: Date | string;
};

export type UserBadgeRow = {
  id: number | string;
  badge_name: string;
  points: number | string | null;
  earned_at: Date | string | null;
};

export type UserReviewRow = {
  review_id: number | string;
  branch_name: string;
  rating: number | string;
  comment: string | null;
  created_at: Date | string;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapUserListRow(row: UserListRow): UserListItem {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    roleName: row.role_name,
    verified: Boolean(row.verified),
    reviewsCount: toNumber(row.reviews_count),
    sessionsCount: toNumber(row.sessions_count),
    lastSessionAt: toIsoString(row.last_session_at),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapUserSessionRow(row: UserSessionRow): UserSessionItem {
  return {
    id: toNumber(row.id),
    revoked: Boolean(row.revoked),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date(0).toISOString(),
    expiresAt: toIsoString(row.expires_at) ?? new Date(0).toISOString(),
  };
}

export function mapUserNotificationRow(
  row: UserNotificationRow
): UserNotificationItem {
  return {
    id: toNumber(row.id),
    title: row.title,
    message: row.message,
    read: Boolean(row.read),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapUserFavoriteRow(row: UserFavoriteRow): UserFavoriteBranchItem {
  return {
    branchId: toNumber(row.branch_id),
    branchName: row.branch_name,
    companyName: row.company_name,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapUserRecentViewRow(
  row: UserRecentViewRow
): UserRecentViewItem {
  return {
    viewId: toNumber(row.view_id),
    companyName: row.company_name,
    branchName: row.branch_name,
    viewedAt: toIsoString(row.viewed_at) ?? new Date(0).toISOString(),
  };
}

export function mapUserBadgeRow(row: UserBadgeRow): UserBadgeItem {
  return {
    id: toNumber(row.id),
    badgeName: row.badge_name,
    points: toNumber(row.points),
    earnedAt: toIsoString(row.earned_at),
  };
}

export function mapUserReviewRow(row: UserReviewRow): UserReviewItem {
  return {
    reviewId: toNumber(row.review_id),
    branchName: row.branch_name,
    rating: toNumber(row.rating),
    comment: row.comment,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapUserDetailRow(
  row: UserDetailRow,
  input: {
    sessions: UserSessionRow[];
    notifications: UserNotificationRow[];
    favorites: UserFavoriteRow[];
    recentViews: UserRecentViewRow[];
    badges: UserBadgeRow[];
    reviews: UserReviewRow[];
  }
): UserDetail {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    roleName: row.role_name,
    verified: Boolean(row.verified),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date(0).toISOString(),
    sessions: input.sessions.map(mapUserSessionRow),
    notifications: input.notifications.map(mapUserNotificationRow),
    favorites: input.favorites.map(mapUserFavoriteRow),
    recentViews: input.recentViews.map(mapUserRecentViewRow),
    badges: input.badges.map(mapUserBadgeRow),
    reviews: input.reviews.map(mapUserReviewRow),
  };
}