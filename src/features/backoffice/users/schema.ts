import { z } from "zod";

const optionalBooleanLike = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "si", "sí"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return value;
}, z.boolean().optional());

export const usersListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  roleId: z.coerce.number().int().positive().optional(),
  verified: optionalBooleanLike,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const userListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  roleName: z.string(),
  verified: z.boolean(),
  reviewsCount: z.number().int(),
  sessionsCount: z.number().int(),
  lastSessionAt: z.string().nullable(),
  createdAt: z.string(),
});

export const usersListResultSchema = z.object({
  items: z.array(userListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const userSessionSchema = z.object({
  id: z.number().int(),
  revoked: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string(),
});

export const userNotificationSchema = z.object({
  id: z.number().int(),
  title: z.string().nullable(),
  message: z.string().nullable(),
  read: z.boolean(),
  createdAt: z.string(),
});

export const userFavoriteBranchSchema = z.object({
  branchId: z.number().int(),
  branchName: z.string(),
  companyName: z.string(),
  createdAt: z.string(),
});

export const userRecentViewSchema = z.object({
  viewId: z.number().int(),
  companyName: z.string().nullable(),
  branchName: z.string().nullable(),
  viewedAt: z.string(),
});

export const userBadgeSchema = z.object({
  id: z.number().int(),
  badgeName: z.string(),
  points: z.number().int(),
  earnedAt: z.string().nullable(),
});

export const userReviewSchema = z.object({
  reviewId: z.number().int(),
  branchName: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  createdAt: z.string(),
});

export const userDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  roleName: z.string(),
  verified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sessions: z.array(userSessionSchema),
  notifications: z.array(userNotificationSchema),
  favorites: z.array(userFavoriteBranchSchema),
  recentViews: z.array(userRecentViewSchema),
  badges: z.array(userBadgeSchema),
  reviews: z.array(userReviewSchema),
});