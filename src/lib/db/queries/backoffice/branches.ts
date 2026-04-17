import type { BranchListFilters } from "@/features/backoffice/branches/types";
import type {
  BranchDetailAforoRow,
  BranchDetailAnalyticsRow,
  BranchDetailContactRow,
  BranchDetailMediaRow,
  BranchDetailRow,
  BranchDetailScheduleRow,
  BranchDetailServiceRow,
  BranchListRow,
} from "@/features/backoffice/branches/mapper";
import { query } from "@/lib/db/server";

type ListBranchesQueryResult = {
  rows: BranchListRow[];
  total: number;
  page: number;
  pageSize: number;
};

function buildListBranchesWhere(filters: BranchListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const index = params.length;
    clauses.push(
      `(cb.name ilike $${index} or c.name ilike $${index} or cb.address ilike $${index})`
    );
  }

  if (typeof filters.companyId === "number") {
    params.push(filters.companyId);
    const index = params.length;
    clauses.push(`cb.company_id = $${index}`);
  }

  if (typeof filters.districtId === "number") {
    params.push(filters.districtId);
    const index = params.length;
    clauses.push(`cb.district_id = $${index}`);
  }

  if (typeof filters.isActive === "boolean") {
    params.push(filters.isActive);
    const index = params.length;
    clauses.push(`cb.is_active = $${index}`);
  }

  const whereSql = clauses.length > 0 ? `where ${clauses.join(" and ")}` : "";
  return { whereSql, params };
}

export async function listBranchesQuery(
  filters: BranchListFilters
): Promise<ListBranchesQueryResult> {
  const page = typeof filters.page === "number" ? filters.page : 1;
  const pageSize = typeof filters.pageSize === "number" ? filters.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const { whereSql, params } = buildListBranchesWhere(filters);

  const countResult = await query<{ total: number | string }>(
    `
      select count(*)::int as total
      from company_branches cb
      inner join companies c
        on c.company_id = cb.company_id
      ${whereSql}
    `,
    params
  );

  const listParams = [...params, pageSize, offset];
  const limitParam = listParams.length - 1;
  const offsetParam = listParams.length;

  const listResult = await query<BranchListRow>(
    `
      select
        cb.branch_id,
        cb.company_id,
        c.name as company_name,
        cb.name,
        cb.address,
        d.name as district_name,
        cb.is_main,
        cb.is_active,
        coalesce(ab.visits_count, 0) as visits_count,
        coalesce(ab.reviews_count, 0) as reviews_count,
        coalesce(abs.final_score, 0) as final_score,
        coalesce(contacts_count.contacts_count, 0) as contacts_count,
        coalesce(schedules_count.schedules_count, 0) as schedules_count,
        coalesce(services_count.services_count, 0) as services_count,
        coalesce(media_count.media_count, 0) as media_count,
        cb.updated_at
      from company_branches cb
      inner join companies c
        on c.company_id = cb.company_id
      left join districts d
        on d.district_id = cb.district_id
      left join analytics_branches ab
        on ab.branch_id = cb.branch_id
      left join analytics_branch_scores abs
        on abs.branch_id = cb.branch_id
      left join lateral (
        select count(*)::int as contacts_count
        from branch_contacts bc
        where bc.branch_id = cb.branch_id
      ) contacts_count
        on true
      left join lateral (
        select count(*)::int as schedules_count
        from branch_schedules bs
        where bs.branch_id = cb.branch_id
      ) schedules_count
        on true
      left join lateral (
        select count(*)::int as services_count
        from branch_services bss
        where bss.branch_id = cb.branch_id
      ) services_count
        on true
      left join lateral (
        select count(*)::int as media_count
        from branch_media bm
        where bm.branch_id = cb.branch_id
      ) media_count
        on true
      ${whereSql}
      order by cb.updated_at desc, cb.branch_id desc
      limit $${limitParam} offset $${offsetParam}
    `,
    listParams
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export async function getBranchDetailQuery(branchId: number) {
  const branchResult = await query<BranchDetailRow>(
    `
      select
        cb.branch_id,
        cb.company_id,
        c.name as company_name,
        cb.name,
        cb.description,
        cb.address,
        cb.phone,
        cb.email,
        d.name as district_name,
        cb.lat,
        cb.lon,
        cb.is_main,
        cb.is_active,
        cb.created_at,
        cb.updated_at
      from company_branches cb
      inner join companies c
        on c.company_id = cb.company_id
      left join districts d
        on d.district_id = cb.district_id
      where cb.branch_id = $1
      limit 1
    `,
    [branchId]
  );

  const branch = branchResult.rows[0] ?? null;

  if (!branch) return null;

  const [
    contactsResult,
    schedulesResult,
    servicesResult,
    mediaResult,
    analyticsResult,
    aforoResult,
  ] = await Promise.all([
    query<BranchDetailContactRow>(
      `
        select
          bc.contact_id,
          bct.name as contact_type_name,
          bc.value,
          bc.label,
          bc.is_primary,
          bc.is_public,
          bc.updated_at
        from branch_contacts bc
        inner join branch_contact_types bct
          on bct.id = bc.contact_type_id
        where bc.branch_id = $1
        order by bc.is_primary desc, bc.contact_id asc
      `,
      [branchId]
    ),
    query<BranchDetailScheduleRow>(
      `
        select
          bs.schedule_id,
          dow.name as day_name,
          dow.iso_number,
          bs.opening,
          bs.closing,
          coalesce(bs.shift_number, 1) as shift_number
        from branch_schedules bs
        inner join days_of_week dow
          on dow.day_id = bs.day_id
        where bs.branch_id = $1
        order by dow.iso_number asc, bs.shift_number asc
      `,
      [branchId]
    ),
    query<BranchDetailServiceRow>(
      `
        select
          s.service_id,
          s.code,
          s.name,
          s.description,
          s.icon,
          bs.is_available
        from branch_services bs
        inner join services s
          on s.service_id = bs.service_id
        where bs.branch_id = $1
        order by s.name asc
      `,
      [branchId]
    ),
    query<BranchDetailMediaRow>(
      `
        select
          bm.media_id,
          mt.name as media_type,
          bm.url,
          bm.updated_at
        from branch_media bm
        left join media_types mt
          on mt.media_type_id = bm.media_type_id
        where bm.branch_id = $1
        order by bm.media_id desc
      `,
      [branchId]
    ),
    query<BranchDetailAnalyticsRow>(
      `
        select
          coalesce(ab.visits_count, 0) as visits_count,
          coalesce(ab.reviews_count, 0) as reviews_count,
          coalesce(ab.average_rating, 0) as average_rating,
          coalesce(ab.aforo_report_count, 0) as aforo_report_count,
          coalesce(ab.average_weighted_status, 0) as average_weighted_status,
          coalesce(abs.popularity_score, 0) as popularity_score,
          coalesce(abs.engagement_score, 0) as engagement_score,
          coalesce(abs.conversion_score, 0) as conversion_score,
          coalesce(abs.trust_score, 0) as trust_score,
          coalesce(abs.freshness_score, 0) as freshness_score,
          coalesce(abs.final_score, 0) as final_score,
          abs.calculated_at
        from company_branches cb
        left join analytics_branches ab
          on ab.branch_id = cb.branch_id
        left join analytics_branch_scores abs
          on abs.branch_id = cb.branch_id
        where cb.branch_id = $1
        limit 1
      `,
      [branchId]
    ),
    query<BranchDetailAforoRow>(
      `
        select
          ar.id as report_id,
          ast.label as status_label,
          ast.code as status_code,
          ar.weight,
          ar.gps_validated,
          ar.created_at
        from aforo_reports ar
        left join aforo_statuses ast
          on ast.id = ar.status_id
        where ar.branch_id = $1
        order by ar.created_at desc, ar.id desc
        limit 20
      `,
      [branchId]
    ),
  ]);

  return {
    branch,
    contacts: contactsResult.rows,
    schedules: schedulesResult.rows,
    services: servicesResult.rows,
    media: mediaResult.rows,
    analytics: analyticsResult.rows[0],
    aforo: aforoResult.rows,
  };
}