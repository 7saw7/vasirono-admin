import { z } from "zod";

export const notificationListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  typeId: z.coerce.number().int().positive().optional(),
  read: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const notificationListItemSchema = z.object({
  id: z.number().int(),
  userId: z.string().uuid().nullable(),
  userName: z.string().nullable(),
  userEmail: z.string().nullable(),
  typeId: z.number().int().nullable(),
  typeName: z.string().nullable(),
  title: z.string().nullable(),
  message: z.string().nullable(),
  read: z.boolean(),
  createdAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
});

export const notificationsListResultSchema = z.object({
  items: z.array(notificationListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const notificationFilterOptionSchema = z.object({
  label: z.string(),
  value: z.number().int(),
});

export const notificationsMetaSchema = z.object({
  types: z.array(notificationFilterOptionSchema),
});

export const notificationSummarySchema = z.object({
  totalNotifications: z.number().int(),
  readNotifications: z.number().int(),
  unreadNotifications: z.number().int(),
  deliveredNotifications: z.number().int(),
});

export const notificationsDashboardDataSchema = z.object({
  notifications: notificationsListResultSchema,
  meta: notificationsMetaSchema,
  summary: notificationSummarySchema,
});