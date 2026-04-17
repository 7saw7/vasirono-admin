import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type UsersListFilters = {
  search?: string;
  roleId?: string | number;
  verified?: string | boolean;
  page?: string | number;
  pageSize?: string | number;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roleName: string;
  verified: boolean;
  reviewsCount: number;
  sessionsCount: number;
  lastSessionAt: string | null;
  createdAt: string;
};

export type UsersListResult = PaginatedResult<UserListItem>;

export type UserSessionItem = {
  id: number;
  revoked: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type UserNotificationItem = {
  id: number;
  title: string | null;
  message: string | null;
  read: boolean;
  createdAt: string;
};

export type UserFavoriteBranchItem = {
  branchId: number;
  branchName: string;
  companyName: string;
  createdAt: string;
};

export type UserRecentViewItem = {
  viewId: number;
  companyName: string | null;
  branchName: string | null;
  viewedAt: string;
};

export type UserBadgeItem = {
  id: number;
  badgeName: string;
  points: number;
  earnedAt: string | null;
};

export type UserReviewItem = {
  reviewId: number;
  branchName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roleName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  sessions: UserSessionItem[];
  notifications: UserNotificationItem[];
  favorites: UserFavoriteBranchItem[];
  recentViews: UserRecentViewItem[];
  badges: UserBadgeItem[];
  reviews: UserReviewItem[];
};