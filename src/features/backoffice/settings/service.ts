import {
  settingsDashboardDataSchema,
  settingsListFiltersSchema,
} from "./schema";
import {
  mapSimpleSettingRow,
  mapVerificationLevelRow,
  mapVerificationMethodRow,
  mapVerificationStatusRow,
} from "./mapper";
import type { SettingsListFilters } from "./types";
import {
  getSettingsSummaryQuery,
  listClaimStatusesQuery,
  listNotificationTypesQuery,
  listPaymentStatusesQuery,
  listRolesQuery,
  listSubscriptionStatusesQuery,
  listVerificationCheckStatusesQuery,
  listVerificationDocumentReviewStatusesQuery,
  listVerificationDocumentTypesQuery,
  listVerificationLevelsQuery,
  listVerificationMethodsQuery,
  listVerificationRequestStatusesQuery,
  listVerificationStatusesQuery,
} from "@/lib/db/queries/backoffice/settings";

export async function getSettingsDashboard(input: SettingsListFilters = {}) {
  const filters = settingsListFiltersSchema.parse(input);

  const [
    summaryRow,
    roles,
    verificationStatuses,
    claimStatuses,
    paymentStatuses,
    subscriptionStatuses,
    notificationTypes,
    verificationLevels,
    verificationMethods,
    verificationRequestStatuses,
    verificationCheckStatuses,
    verificationDocumentTypes,
    verificationDocumentReviewStatuses,
  ] = await Promise.all([
    getSettingsSummaryQuery(),
    listRolesQuery(filters),
    listVerificationStatusesQuery(filters),
    listClaimStatusesQuery(filters),
    listPaymentStatusesQuery(filters),
    listSubscriptionStatusesQuery(filters),
    listNotificationTypesQuery(filters),
    listVerificationLevelsQuery(filters),
    listVerificationMethodsQuery(filters),
    listVerificationRequestStatusesQuery(filters),
    listVerificationCheckStatusesQuery(filters),
    listVerificationDocumentTypesQuery(filters),
    listVerificationDocumentReviewStatusesQuery(filters),
  ]);

  return settingsDashboardDataSchema.parse({
    summary: {
      totalRoles: Number(summaryRow.total_roles ?? 0),
      totalVerificationStatuses: Number(
        summaryRow.total_verification_statuses ?? 0
      ),
      totalClaimStatuses: Number(summaryRow.total_claim_statuses ?? 0),
      totalPaymentStatuses: Number(summaryRow.total_payment_statuses ?? 0),
      totalSubscriptionStatuses: Number(
        summaryRow.total_subscription_statuses ?? 0
      ),
      totalNotificationTypes: Number(summaryRow.total_notification_types ?? 0),
      totalVerificationLevels: Number(
        summaryRow.total_verification_levels ?? 0
      ),
      totalVerificationMethods: Number(
        summaryRow.total_verification_methods ?? 0
      ),
      totalVerificationRequestStatuses: Number(
        summaryRow.total_verification_request_statuses ?? 0
      ),
      totalVerificationCheckStatuses: Number(
        summaryRow.total_verification_check_statuses ?? 0
      ),
      totalVerificationDocumentTypes: Number(
        summaryRow.total_verification_document_types ?? 0
      ),
      totalVerificationDocumentReviewStatuses: Number(
        summaryRow.total_verification_document_review_statuses ?? 0
      ),
    },
    roles: {
      items: roles.rows.map(mapSimpleSettingRow),
      page: roles.page,
      pageSize: roles.pageSize,
      total: roles.total,
    },
    verificationStatuses: {
      items: verificationStatuses.rows.map(mapSimpleSettingRow),
      page: verificationStatuses.page,
      pageSize: verificationStatuses.pageSize,
      total: verificationStatuses.total,
    },
    claimStatuses: {
      items: claimStatuses.rows.map(mapSimpleSettingRow),
      page: claimStatuses.page,
      pageSize: claimStatuses.pageSize,
      total: claimStatuses.total,
    },
    paymentStatuses: {
      items: paymentStatuses.rows.map(mapSimpleSettingRow),
      page: paymentStatuses.page,
      pageSize: paymentStatuses.pageSize,
      total: paymentStatuses.total,
    },
    subscriptionStatuses: {
      items: subscriptionStatuses.rows.map(mapSimpleSettingRow),
      page: subscriptionStatuses.page,
      pageSize: subscriptionStatuses.pageSize,
      total: subscriptionStatuses.total,
    },
    notificationTypes: {
      items: notificationTypes.rows.map(mapSimpleSettingRow),
      page: notificationTypes.page,
      pageSize: notificationTypes.pageSize,
      total: notificationTypes.total,
    },
    verificationLevels: {
      items: verificationLevels.rows.map(mapVerificationLevelRow),
      page: verificationLevels.page,
      pageSize: verificationLevels.pageSize,
      total: verificationLevels.total,
    },
    verificationMethods: {
      items: verificationMethods.rows.map(mapVerificationMethodRow),
      page: verificationMethods.page,
      pageSize: verificationMethods.pageSize,
      total: verificationMethods.total,
    },
    verificationRequestStatuses: {
      items: verificationRequestStatuses.rows.map(mapVerificationStatusRow),
      page: verificationRequestStatuses.page,
      pageSize: verificationRequestStatuses.pageSize,
      total: verificationRequestStatuses.total,
    },
    verificationCheckStatuses: {
      items: verificationCheckStatuses.rows.map(mapVerificationStatusRow),
      page: verificationCheckStatuses.page,
      pageSize: verificationCheckStatuses.pageSize,
      total: verificationCheckStatuses.total,
    },
    verificationDocumentTypes: {
      items: verificationDocumentTypes.rows.map(mapVerificationLevelRow),
      page: verificationDocumentTypes.page,
      pageSize: verificationDocumentTypes.pageSize,
      total: verificationDocumentTypes.total,
    },
    verificationDocumentReviewStatuses: {
      items: verificationDocumentReviewStatuses.rows.map(
        mapVerificationStatusRow
      ),
      page: verificationDocumentReviewStatuses.page,
      pageSize: verificationDocumentReviewStatuses.pageSize,
      total: verificationDocumentReviewStatuses.total,
    },
  });
}