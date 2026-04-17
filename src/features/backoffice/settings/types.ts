import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type SettingsListFilters = {
  search?: string;
  page?: string | number;
  pageSize?: string | number;
};

export type SimpleSettingItem = {
  id: number;
  name: string;
};

export type VerificationLevelItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type VerificationMethodItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  requiresDocument: boolean;
  requiresManualReview: boolean;
  isActive: boolean;
};

export type VerificationStatusItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isTerminal: boolean;
};

export type SettingsSummary = {
  totalRoles: number;
  totalVerificationStatuses: number;
  totalClaimStatuses: number;
  totalPaymentStatuses: number;
  totalSubscriptionStatuses: number;
  totalNotificationTypes: number;
  totalVerificationLevels: number;
  totalVerificationMethods: number;
  totalVerificationRequestStatuses: number;
  totalVerificationCheckStatuses: number;
  totalVerificationDocumentTypes: number;
  totalVerificationDocumentReviewStatuses: number;
};

export type SettingsDashboardData = {
  summary: SettingsSummary;
  roles: PaginatedResult<SimpleSettingItem>;
  verificationStatuses: PaginatedResult<SimpleSettingItem>;
  claimStatuses: PaginatedResult<SimpleSettingItem>;
  paymentStatuses: PaginatedResult<SimpleSettingItem>;
  subscriptionStatuses: PaginatedResult<SimpleSettingItem>;
  notificationTypes: PaginatedResult<SimpleSettingItem>;
  verificationLevels: PaginatedResult<VerificationLevelItem>;
  verificationMethods: PaginatedResult<VerificationMethodItem>;
  verificationRequestStatuses: PaginatedResult<VerificationStatusItem>;
  verificationCheckStatuses: PaginatedResult<VerificationStatusItem>;
  verificationDocumentTypes: PaginatedResult<VerificationLevelItem>;
  verificationDocumentReviewStatuses: PaginatedResult<VerificationStatusItem>;
};