import type { Option, PaginatedResult } from "@/features/backoffice/shared/types";

export type NotificationListFilters = {
  search?: string;
  typeId?: string | number;
  read?: string | boolean;
  userId?: string;
  page?: string | number;
  pageSize?: string | number;
};

export type NotificationListItem = {
  id: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  typeId: number | null;
  typeName: string | null;
  title: string | null;
  message: string | null;
  read: boolean;
  createdAt: string | null;
  deliveredAt: string | null;
};

export type NotificationsListResult = PaginatedResult<NotificationListItem>;

export type NotificationFilterOption = Option<number>;

export type NotificationsMeta = {
  types: NotificationFilterOption[];
};

export type NotificationSummary = {
  totalNotifications: number;
  readNotifications: number;
  unreadNotifications: number;
  deliveredNotifications: number;
};

export type NotificationsDashboardData = {
  notifications: NotificationsListResult;
  meta: NotificationsMeta;
  summary: NotificationSummary;
};