import type { PoolClient, QueryResultRow } from "pg";
import { query } from "@/lib/db/server";
import type { TaxonomyListFilters } from "@/features/backoffice/taxonomies/types";
import type {
  BusinessTypeListRow,
  CategoryListRow,
  ServiceListRow,
  SubcategoryListRow,
} from "@/features/backoffice/taxonomies/mapper";

type CountRow = {
  total: number | string;
};

type TaxonomySummaryRow = {
  total_business_types: number | string | null;
  total_categories: number | string | null;
  total_subcategories: number | string | null;
  total_services: number | string | null;
};

function normalizePage(value: string | number | undefined, fallback = 1) {
  const parsed = typeof value === "number" ? value : Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNumericId(value: string | number | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBooleanOrNull(
  value: string | boolean | undefined
): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

async function runQuery<T extends QueryResultRow>(
  client: PoolClient | undefined,
  text: string,
  params: unknown[] = []
) {
  return client ? client.query<T>(text, params) : query<T>(text, params);
}

function createStatusError(status: number, message: string) {
  const error = new Error(message);
  Object.assign(error, { status });
  return error;
}

function buildBusinessTypesWhere(filters: TaxonomyListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    clauses.push(`bt.name ilike $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

function buildCategoriesWhere(filters: TaxonomyListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    clauses.push(`c.name ilike $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

function buildSubcategoriesWhere(filters: TaxonomyListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(`(s.name ilike $${i} or c.name ilike $${i})`);
  }

  const categoryId = toNumericId(filters.categoryId);
  if (categoryId) {
    params.push(categoryId);
    clauses.push(`s.category_id = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

function buildServicesWhere(filters: TaxonomyListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(
      `(sv.name ilike $${i} or sv.code ilike $${i} or coalesce(sv.description, '') ilike $${i})`
    );
  }

  const active = toBooleanOrNull(filters.active);
  if (active !== null) {
    params.push(active);
    clauses.push(`sv.is_active = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

export async function listBusinessTypesQuery(filters: TaxonomyListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildBusinessTypesWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from business_types bt
      ${whereSql}
    `,
    params
  );

  const listResult = await query<BusinessTypeListRow>(
    `
      select
        bt.type_id as id,
        bt.name,
        count(distinct cbt.company_id)::int as companies_count
      from business_types bt
      left join company_business_types cbt
        on cbt.type_id = bt.type_id
      ${whereSql}
      group by bt.type_id, bt.name
      order by bt.name asc nulls last
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

export async function listCategoriesQuery(filters: TaxonomyListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildCategoriesWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from categories c
      ${whereSql}
    `,
    params
  );

  const listResult = await query<CategoryListRow>(
    `
      select
        c.category_id as id,
        c.name,
        count(distinct s.subcategory_id)::int as subcategories_count,
        count(distinct cs.company_id)::int as companies_count
      from categories c
      left join subcategories s
        on s.category_id = c.category_id
      left join company_subcategories cs
        on cs.subcategory_id = s.subcategory_id
      ${whereSql}
      group by c.category_id, c.name
      order by c.name asc
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

export async function listSubcategoriesQuery(filters: TaxonomyListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildSubcategoriesWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from subcategories s
      inner join categories c
        on c.category_id = s.category_id
      ${whereSql}
    `,
    params
  );

  const listResult = await query<SubcategoryListRow>(
    `
      select
        s.subcategory_id as id,
        s.category_id,
        c.name as category_name,
        s.name,
        count(distinct cs.company_id)::int as companies_count
      from subcategories s
      inner join categories c
        on c.category_id = s.category_id
      left join company_subcategories cs
        on cs.subcategory_id = s.subcategory_id
      ${whereSql}
      group by s.subcategory_id, s.category_id, c.name, s.name
      order by c.name asc, s.name asc
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

export async function listServicesQuery(filters: TaxonomyListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildServicesWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from services sv
      ${whereSql}
    `,
    params
  );

  const listResult = await query<ServiceListRow>(
    `
      select
        sv.service_id as id,
        sv.code,
        sv.name,
        sv.description,
        sv.icon,
        sv.is_active,
        count(distinct bs.branch_id)::int as branches_count
      from services sv
      left join branch_services bs
        on bs.service_id = sv.service_id
      ${whereSql}
      group by
        sv.service_id,
        sv.code,
        sv.name,
        sv.description,
        sv.icon,
        sv.is_active
      order by sv.name asc
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

export async function getTaxonomiesSummaryQuery() {
  const result = await query<TaxonomySummaryRow>(
    `
      select
        (select count(*)::int from business_types) as total_business_types,
        (select count(*)::int from categories) as total_categories,
        (select count(*)::int from subcategories) as total_subcategories,
        (select count(*)::int from services) as total_services
    `
  );

  return result.rows[0] ?? {
    total_business_types: 0,
    total_categories: 0,
    total_subcategories: 0,
    total_services: 0,
  };
}

export async function getBusinessTypeByIdQuery(
  typeId: number,
  client?: PoolClient
) {
  const result = await runQuery<BusinessTypeListRow>(
    client,
    `
      select
        bt.type_id as id,
        bt.name,
        count(distinct cbt.company_id)::int as companies_count
      from business_types bt
      left join company_business_types cbt
        on cbt.type_id = bt.type_id
      where bt.type_id = $1
      group by bt.type_id, bt.name
      limit 1
    `,
    [typeId]
  );

  return result.rows[0] ?? null;
}

export async function getCategoryByIdQuery(
  categoryId: number,
  client?: PoolClient
) {
  const result = await runQuery<CategoryListRow>(
    client,
    `
      select
        c.category_id as id,
        c.name,
        count(distinct s.subcategory_id)::int as subcategories_count,
        count(distinct cs.company_id)::int as companies_count
      from categories c
      left join subcategories s
        on s.category_id = c.category_id
      left join company_subcategories cs
        on cs.subcategory_id = s.subcategory_id
      where c.category_id = $1
      group by c.category_id, c.name
      limit 1
    `,
    [categoryId]
  );

  return result.rows[0] ?? null;
}

export async function getSubcategoryByIdQuery(
  subcategoryId: number,
  client?: PoolClient
) {
  const result = await runQuery<SubcategoryListRow>(
    client,
    `
      select
        s.subcategory_id as id,
        s.category_id,
        c.name as category_name,
        s.name,
        count(distinct cs.company_id)::int as companies_count
      from subcategories s
      inner join categories c
        on c.category_id = s.category_id
      left join company_subcategories cs
        on cs.subcategory_id = s.subcategory_id
      where s.subcategory_id = $1
      group by s.subcategory_id, s.category_id, c.name, s.name
      limit 1
    `,
    [subcategoryId]
  );

  return result.rows[0] ?? null;
}

export async function getServiceByIdQuery(
  serviceId: number,
  client?: PoolClient
) {
  const result = await runQuery<ServiceListRow>(
    client,
    `
      select
        sv.service_id as id,
        sv.code,
        sv.name,
        sv.description,
        sv.icon,
        sv.is_active,
        count(distinct bs.branch_id)::int as branches_count
      from services sv
      left join branch_services bs
        on bs.service_id = sv.service_id
      where sv.service_id = $1
      group by
        sv.service_id,
        sv.code,
        sv.name,
        sv.description,
        sv.icon,
        sv.is_active
      limit 1
    `,
    [serviceId]
  );

  return result.rows[0] ?? null;
}

export async function ensureCategoryExistsQuery(
  categoryId: number,
  client?: PoolClient
) {
  const result = await runQuery<{ exists: number }>(
    client,
    `select 1 as exists from categories where category_id = $1 limit 1`,
    [categoryId]
  );

  if (result.rows.length === 0) {
    throw createStatusError(404, "La categoría indicada no existe.");
  }
}

export async function ensureBusinessTypeNameAvailableQuery(
  name: string,
  excludeId?: number,
  client?: PoolClient
) {
  const params: unknown[] = [name.trim().toLowerCase()];
  let sql = `
    select type_id
    from business_types
    where lower(trim(name)) = $1
  `;

  if (excludeId) {
    params.push(excludeId);
    sql += ` and type_id <> $2`;
  }

  sql += ` limit 1`;

  const result = await runQuery<{ type_id: number }>(client, sql, params);

  if (result.rows.length > 0) {
    throw createStatusError(409, "Ya existe un tipo de negocio con ese nombre.");
  }
}

export async function ensureCategoryNameAvailableQuery(
  name: string,
  excludeId?: number,
  client?: PoolClient
) {
  const params: unknown[] = [name.trim().toLowerCase()];
  let sql = `
    select category_id
    from categories
    where lower(trim(name)) = $1
  `;

  if (excludeId) {
    params.push(excludeId);
    sql += ` and category_id <> $2`;
  }

  sql += ` limit 1`;

  const result = await runQuery<{ category_id: number }>(client, sql, params);

  if (result.rows.length > 0) {
    throw createStatusError(409, "Ya existe una categoría con ese nombre.");
  }
}

export async function ensureSubcategoryNameAvailableQuery(
  categoryId: number,
  name: string,
  excludeId?: number,
  client?: PoolClient
) {
  const params: unknown[] = [categoryId, name.trim().toLowerCase()];
  let sql = `
    select subcategory_id
    from subcategories
    where category_id = $1
      and lower(trim(name)) = $2
  `;

  if (excludeId) {
    params.push(excludeId);
    sql += ` and subcategory_id <> $3`;
  }

  sql += ` limit 1`;

  const result = await runQuery<{ subcategory_id: number }>(client, sql, params);

  if (result.rows.length > 0) {
    throw createStatusError(
      409,
      "Ya existe una subcategoría con ese nombre dentro de la categoría seleccionada."
    );
  }
}

export async function ensureServiceCodeAvailableQuery(
  code: string,
  excludeId?: number,
  client?: PoolClient
) {
  const params: unknown[] = [code.trim().toLowerCase()];
  let sql = `
    select service_id
    from services
    where lower(trim(code)) = $1
  `;

  if (excludeId) {
    params.push(excludeId);
    sql += ` and service_id <> $2`;
  }

  sql += ` limit 1`;

  const result = await runQuery<{ service_id: number }>(client, sql, params);

  if (result.rows.length > 0) {
    throw createStatusError(409, "Ya existe un servicio con ese código.");
  }
}

export async function ensureServiceNameAvailableQuery(
  name: string,
  excludeId?: number,
  client?: PoolClient
) {
  const params: unknown[] = [name.trim().toLowerCase()];
  let sql = `
    select service_id
    from services
    where lower(trim(name)) = $1
  `;

  if (excludeId) {
    params.push(excludeId);
    sql += ` and service_id <> $2`;
  }

  sql += ` limit 1`;

  const result = await runQuery<{ service_id: number }>(client, sql, params);

  if (result.rows.length > 0) {
    throw createStatusError(409, "Ya existe un servicio con ese nombre.");
  }
}

export async function createBusinessTypeQuery(
  input: { name: string },
  client?: PoolClient
) {
  const result = await runQuery<{ type_id: number }>(
    client,
    `
      insert into business_types (name)
      values ($1)
      returning type_id
    `,
    [input.name.trim()]
  );

  return Number(result.rows[0]?.type_id);
}

export async function updateBusinessTypeQuery(
  typeId: number,
  input: { name?: string },
  client?: PoolClient
) {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    params.push(input.name.trim());
    fields.push(`name = $${params.length}`);
  }

  if (fields.length === 0) {
    throw createStatusError(400, "No se enviaron cambios para el tipo de negocio.");
  }

  params.push(typeId);

  const result = await runQuery<{ type_id: number }>(
    client,
    `
      update business_types
      set ${fields.join(", ")}
      where type_id = $${params.length}
      returning type_id
    `,
    params
  );

  if (result.rows.length === 0) {
    throw createStatusError(404, "El tipo de negocio no existe.");
  }

  return Number(result.rows[0].type_id);
}

export async function createCategoryQuery(
  input: { name: string },
  client?: PoolClient
) {
  const result = await runQuery<{ category_id: number }>(
    client,
    `
      insert into categories (name)
      values ($1)
      returning category_id
    `,
    [input.name.trim()]
  );

  return Number(result.rows[0]?.category_id);
}

export async function updateCategoryQuery(
  categoryId: number,
  input: { name?: string },
  client?: PoolClient
) {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    params.push(input.name.trim());
    fields.push(`name = $${params.length}`);
  }

  params.push(new Date().toISOString());
  fields.push(`updated_at = $${params.length}`);

  params.push(categoryId);

  const result = await runQuery<{ category_id: number }>(
    client,
    `
      update categories
      set ${fields.join(", ")}
      where category_id = $${params.length}
      returning category_id
    `,
    params
  );

  if (result.rows.length === 0) {
    throw createStatusError(404, "La categoría no existe.");
  }

  return Number(result.rows[0].category_id);
}

export async function createSubcategoryQuery(
  input: { categoryId: number; name: string },
  client?: PoolClient
) {
  const result = await runQuery<{ subcategory_id: number }>(
    client,
    `
      insert into subcategories (category_id, name)
      values ($1, $2)
      returning subcategory_id
    `,
    [input.categoryId, input.name.trim()]
  );

  return Number(result.rows[0]?.subcategory_id);
}

export async function updateSubcategoryQuery(
  subcategoryId: number,
  input: { categoryId?: number; name?: string },
  client?: PoolClient
) {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (input.categoryId !== undefined) {
    params.push(input.categoryId);
    fields.push(`category_id = $${params.length}`);
  }

  if (input.name !== undefined) {
    params.push(input.name.trim());
    fields.push(`name = $${params.length}`);
  }

  params.push(new Date().toISOString());
  fields.push(`updated_at = $${params.length}`);

  params.push(subcategoryId);

  const result = await runQuery<{ subcategory_id: number }>(
    client,
    `
      update subcategories
      set ${fields.join(", ")}
      where subcategory_id = $${params.length}
      returning subcategory_id
    `,
    params
  );

  if (result.rows.length === 0) {
    throw createStatusError(404, "La subcategoría no existe.");
  }

  return Number(result.rows[0].subcategory_id);
}

export async function createServiceQuery(
  input: {
    code: string;
    name: string;
    description?: string | null;
    icon?: string | null;
    isActive?: boolean;
  },
  client?: PoolClient
) {
  const result = await runQuery<{ service_id: number }>(
    client,
    `
      insert into services (code, name, description, icon, is_active)
      values ($1, $2, $3, $4, $5)
      returning service_id
    `,
    [
      input.code.trim().toLowerCase(),
      input.name.trim(),
      input.description?.trim() || null,
      input.icon?.trim() || null,
      input.isActive ?? true,
    ]
  );

  return Number(result.rows[0]?.service_id);
}

export async function updateServiceQuery(
  serviceId: number,
  input: {
    code?: string;
    name?: string;
    description?: string | null;
    icon?: string | null;
    isActive?: boolean;
  },
  client?: PoolClient
) {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (input.code !== undefined) {
    params.push(input.code.trim().toLowerCase());
    fields.push(`code = $${params.length}`);
  }

  if (input.name !== undefined) {
    params.push(input.name.trim());
    fields.push(`name = $${params.length}`);
  }

  if (input.description !== undefined) {
    params.push(input.description?.trim() || null);
    fields.push(`description = $${params.length}`);
  }

  if (input.icon !== undefined) {
    params.push(input.icon?.trim() || null);
    fields.push(`icon = $${params.length}`);
  }

  if (input.isActive !== undefined) {
    params.push(input.isActive);
    fields.push(`is_active = $${params.length}`);
  }

  params.push(new Date().toISOString());
  fields.push(`updated_at = $${params.length}`);

  params.push(serviceId);

  const result = await runQuery<{ service_id: number }>(
    client,
    `
      update services
      set ${fields.join(", ")}
      where service_id = $${params.length}
      returning service_id
    `,
    params
  );

  if (result.rows.length === 0) {
    throw createStatusError(404, "El servicio no existe.");
  }

  return Number(result.rows[0].service_id);
}