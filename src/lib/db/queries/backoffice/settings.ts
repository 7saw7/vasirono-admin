import { query } from "@/lib/db/server";
import type { SettingsListFilters } from "@/features/backoffice/settings/types";
import type {
  SimpleSettingRow,
  VerificationLevelRow,
  VerificationMethodRow,
  VerificationStatusRow,
} from "@/features/backoffice/settings/mapper";

type CountRow = {
  total: number | string;
};

type SettingsSummaryRow = {
  total_roles: number | string | null;
  total_verification_statuses: number | string | null;
  total_claim_statuses: number | string | null;
  total_payment_statuses: number | string | null;
  total_subscription_statuses: number | string | null;
  total_notification_types: number | string | null;
  total_verification_levels: number | string | null;
  total_verification_methods: number | string | null;
  total_verification_request_statuses: number | string | null;
  total_verification_check_statuses: number | string | null;
  total_verification_document_types: number | string | null;
  total_verification_document_review_statuses: number | string | null;
};

function normalizePage(value: string | number | undefined, fallback = 1) {
  const parsed = typeof value === "number" ? value : Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildSimpleWhere(search: string | undefined, alias: string) {
  const params: unknown[] = [];
  let whereSql = "";

  if (search?.trim()) {
    params.push(`%${search.trim()}%`);
    whereSql = `where ${alias}.name ilike $1`;
  }

  return { params, whereSql };
}

function buildCodeNameWhere(
  search: string | undefined,
  alias: string,
  includeDescription = false
) {
  const params: unknown[] = [];
  let whereSql = "";

  if (search?.trim()) {
    params.push(`%${search.trim()}%`);
    const i = params.length;
    whereSql = includeDescription
      ? `where (${alias}.code ilike $${i} or ${alias}.name ilike $${i} or coalesce(${alias}.description, '') ilike $${i})`
      : `where (${alias}.code ilike $${i} or ${alias}.name ilike $${i})`;
  }

  return { params, whereSql };
}

async function runSimpleCatalogQuery(
  table: string,
  idColumn: string,
  nameColumn: string,
  alias: string,
  filters: SettingsListFilters
) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;
  const { params, whereSql } = buildSimpleWhere(filters.search, alias);

  const countResult = await query<CountRow>(
    `select count(*)::int as total from ${table} ${alias} ${whereSql}`,
    params
  );

  const listResult = await query<SimpleSettingRow>(
    `
      select
        ${alias}.${idColumn} as id,
        ${alias}.${nameColumn} as name
      from ${table} ${alias}
      ${whereSql}
      order by ${alias}.${nameColumn} asc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export function listRolesQuery(filters: SettingsListFilters) {
  return runSimpleCatalogQuery("roles", "id", "name", "r", filters);
}

export function listVerificationStatusesQuery(filters: SettingsListFilters) {
  return runSimpleCatalogQuery(
    "verification_statuses",
    "id",
    "name",
    "vs",
    filters
  );
}

export function listClaimStatusesQuery(filters: SettingsListFilters) {
  return runSimpleCatalogQuery(
    "claim_request_statuses",
    "id",
    "name",
    "crs",
    filters
  );
}

export function listPaymentStatusesQuery(filters: SettingsListFilters) {
  return runSimpleCatalogQuery("payment_statuses", "id", "name", "ps", filters);
}

export function listSubscriptionStatusesQuery(filters: SettingsListFilters) {
  return runSimpleCatalogQuery(
    "subscription_statuses",
    "id",
    "name",
    "ss",
    filters
  );
}

export function listNotificationTypesQuery(filters: SettingsListFilters) {
  return runSimpleCatalogQuery(
    "notification_types",
    "id",
    "name",
    "nt",
    filters
  );
}

export async function listVerificationLevelsQuery(filters: SettingsListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;
  const { params, whereSql } = buildCodeNameWhere(filters.search, "bvl", true);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from business_verification_levels bvl
      ${whereSql}
    `,
    params
  );

  const listResult = await query<VerificationLevelRow>(
    `
      select
        bvl.id,
        bvl.code,
        bvl.name,
        bvl.description,
        bvl.sort_order
      from business_verification_levels bvl
      ${whereSql}
      order by bvl.sort_order asc, bvl.name asc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export async function listVerificationMethodsQuery(filters: SettingsListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;
  const { params, whereSql } = buildCodeNameWhere(filters.search, "bvm", true);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from business_verification_methods bvm
      ${whereSql}
    `,
    params
  );

  const listResult = await query<VerificationMethodRow>(
    `
      select
        bvm.id,
        bvm.code,
        bvm.name,
        bvm.description,
        bvm.requires_document,
        bvm.requires_manual_review,
        bvm.is_active
      from business_verification_methods bvm
      ${whereSql}
      order by bvm.name asc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

async function runVerificationStatusCatalogQuery(
  table: string,
  alias: string,
  filters: SettingsListFilters
) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;
  const { params, whereSql } = buildCodeNameWhere(filters.search, alias, true);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from ${table} ${alias}
      ${whereSql}
    `,
    params
  );

  const listResult = await query<VerificationStatusRow>(
    `
      select
        ${alias}.id,
        ${alias}.code,
        ${alias}.name,
        ${alias}.description,
        ${alias}.sort_order,
        ${alias}.is_terminal
      from ${table} ${alias}
      ${whereSql}
      order by ${alias}.sort_order asc, ${alias}.name asc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export function listVerificationRequestStatusesQuery(
  filters: SettingsListFilters
) {
  return runVerificationStatusCatalogQuery(
    "business_verification_request_statuses",
    "bvrs",
    filters
  );
}

export function listVerificationCheckStatusesQuery(
  filters: SettingsListFilters
) {
  return runVerificationStatusCatalogQuery(
    "business_verification_check_statuses",
    "bvcs",
    filters
  );
}

export async function listVerificationDocumentTypesQuery(
  filters: SettingsListFilters
) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;
  const { params, whereSql } = buildCodeNameWhere(filters.search, "bvdt", true);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from business_verification_document_types bvdt
      ${whereSql}
    `,
    params
  );

  const listResult = await query<VerificationLevelRow>(
    `
      select
        bvdt.id,
        bvdt.code,
        bvdt.name,
        bvdt.description,
        0 as sort_order
      from business_verification_document_types bvdt
      ${whereSql}
      order by bvdt.name asc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export function listVerificationDocumentReviewStatusesQuery(
  filters: SettingsListFilters
) {
  return runVerificationStatusCatalogQuery(
    "business_verification_document_review_statuses",
    "bvdrs",
    filters
  );
}

export async function getSettingsSummaryQuery() {
  const result = await query<SettingsSummaryRow>(
    `
      select
        (select count(*)::int from roles) as total_roles,
        (select count(*)::int from verification_statuses) as total_verification_statuses,
        (select count(*)::int from claim_request_statuses) as total_claim_statuses,
        (select count(*)::int from payment_statuses) as total_payment_statuses,
        (select count(*)::int from subscription_statuses) as total_subscription_statuses,
        (select count(*)::int from notification_types) as total_notification_types,
        (select count(*)::int from business_verification_levels) as total_verification_levels,
        (select count(*)::int from business_verification_methods) as total_verification_methods,
        (select count(*)::int from business_verification_request_statuses) as total_verification_request_statuses,
        (select count(*)::int from business_verification_check_statuses) as total_verification_check_statuses,
        (select count(*)::int from business_verification_document_types) as total_verification_document_types,
        (select count(*)::int from business_verification_document_review_statuses) as total_verification_document_review_statuses
    `
  );

  return result.rows[0] ?? {
    total_roles: 0,
    total_verification_statuses: 0,
    total_claim_statuses: 0,
    total_payment_statuses: 0,
    total_subscription_statuses: 0,
    total_notification_types: 0,
    total_verification_levels: 0,
    total_verification_methods: 0,
    total_verification_request_statuses: 0,
    total_verification_check_statuses: 0,
    total_verification_document_types: 0,
    total_verification_document_review_statuses: 0,
  };
}