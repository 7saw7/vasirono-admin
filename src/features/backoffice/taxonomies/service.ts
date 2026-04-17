import { withTransaction } from "@/lib/db/server";
import {
  createBusinessTypeSchema,
  createCategorySchema,
  createServiceSchema,
  createSubcategorySchema,
  paginatedBusinessTypesSchema,
  paginatedCategoriesSchema,
  paginatedServicesSchema,
  paginatedSubcategoriesSchema,
  taxonomiesDashboardDataSchema,
  taxonomyListFiltersSchema,
  updateBusinessTypeSchema,
  updateCategorySchema,
  updateServiceSchema,
  updateSubcategorySchema,
} from "./schema";
import {
  mapBusinessTypeListRow,
  mapCategoryListRow,
  mapServiceListRow,
  mapSubcategoryListRow,
} from "./mapper";
import type {
  CreateBusinessTypeInput,
  CreateCategoryInput,
  CreateServiceInput,
  CreateSubcategoryInput,
  TaxonomyListFilters,
  UpdateBusinessTypeInput,
  UpdateCategoryInput,
  UpdateServiceInput,
  UpdateSubcategoryInput,
} from "./types";
import {
  createBusinessTypeQuery,
  createCategoryQuery,
  createServiceQuery,
  createSubcategoryQuery,
  ensureBusinessTypeNameAvailableQuery,
  ensureCategoryExistsQuery,
  ensureCategoryNameAvailableQuery,
  ensureServiceCodeAvailableQuery,
  ensureServiceNameAvailableQuery,
  ensureSubcategoryNameAvailableQuery,
  getBusinessTypeByIdQuery,
  getCategoryByIdQuery,
  getServiceByIdQuery,
  getSubcategoryByIdQuery,
  getTaxonomiesSummaryQuery,
  listBusinessTypesQuery,
  listCategoriesQuery,
  listServicesQuery,
  listSubcategoriesQuery,
  updateBusinessTypeQuery,
  updateCategoryQuery,
  updateServiceQuery,
  updateSubcategoryQuery,
} from "@/lib/db/queries/backoffice/taxonomies";
import type { TaxonomiesDashboardFilters } from "./types";

export async function getBusinessTypesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const result = await listBusinessTypesQuery(filters);

  return paginatedBusinessTypesSchema.parse({
    items: result.rows.map(mapBusinessTypeListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getCategoriesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const result = await listCategoriesQuery(filters);

  return paginatedCategoriesSchema.parse({
    items: result.rows.map(mapCategoryListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getSubcategoriesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const result = await listSubcategoriesQuery(filters);

  return paginatedSubcategoriesSchema.parse({
    items: result.rows.map(mapSubcategoryListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getServicesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const result = await listServicesQuery(filters);

  return paginatedServicesSchema.parse({
    items: result.rows.map(mapServiceListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getTaxonomiesDashboard(
  input: TaxonomiesDashboardFilters = {}
) {
  const businessTypesFilters = taxonomyListFiltersSchema.parse(
    input.businessTypes ?? {}
  );
  const categoriesFilters = taxonomyListFiltersSchema.parse(
    input.categories ?? {}
  );
  const subcategoriesFilters = taxonomyListFiltersSchema.parse(
    input.subcategories ?? {}
  );
  const servicesFilters = taxonomyListFiltersSchema.parse(
    input.services ?? {}
  );

  const [summaryRow, businessTypes, categories, subcategories, services] =
    await Promise.all([
      getTaxonomiesSummaryQuery(),
      listBusinessTypesQuery(businessTypesFilters),
      listCategoriesQuery(categoriesFilters),
      listSubcategoriesQuery(subcategoriesFilters),
      listServicesQuery(servicesFilters),
    ]);

  return taxonomiesDashboardDataSchema.parse({
    summary: {
      totalBusinessTypes: Number(summaryRow.total_business_types ?? 0),
      totalCategories: Number(summaryRow.total_categories ?? 0),
      totalSubcategories: Number(summaryRow.total_subcategories ?? 0),
      totalServices: Number(summaryRow.total_services ?? 0),
    },
    businessTypes: {
      items: businessTypes.rows.map(mapBusinessTypeListRow),
      page: businessTypes.page,
      pageSize: businessTypes.pageSize,
      total: businessTypes.total,
    },
    categories: {
      items: categories.rows.map(mapCategoryListRow),
      page: categories.page,
      pageSize: categories.pageSize,
      total: categories.total,
    },
    subcategories: {
      items: subcategories.rows.map(mapSubcategoryListRow),
      page: subcategories.page,
      pageSize: subcategories.pageSize,
      total: subcategories.total,
    },
    services: {
      items: services.rows.map(mapServiceListRow),
      page: services.page,
      pageSize: services.pageSize,
      total: services.total,
    },
  });
}

export async function createBusinessType(input: CreateBusinessTypeInput) {
  const payload = createBusinessTypeSchema.parse(input);

  return withTransaction(async (client) => {
    await ensureBusinessTypeNameAvailableQuery(payload.name, undefined, client);

    const id = await createBusinessTypeQuery(payload, client);
    const row = await getBusinessTypeByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar el tipo de negocio creado.");
    }

    return mapBusinessTypeListRow(row);
  });
}

export async function updateBusinessType(
  typeId: number,
  input: UpdateBusinessTypeInput
) {
  const payload = updateBusinessTypeSchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getBusinessTypeByIdQuery(typeId, client);

    if (!current) {
      const error = new Error("El tipo de negocio no existe.");
      Object.assign(error, { status: 404 });
      throw error;
    }

    if (payload.name !== undefined) {
      await ensureBusinessTypeNameAvailableQuery(payload.name, typeId, client);
    }

    const id = await updateBusinessTypeQuery(typeId, payload, client);
    const row = await getBusinessTypeByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar el tipo de negocio actualizado.");
    }

    return mapBusinessTypeListRow(row);
  });
}

export async function createCategory(input: CreateCategoryInput) {
  const payload = createCategorySchema.parse(input);

  return withTransaction(async (client) => {
    await ensureCategoryNameAvailableQuery(payload.name, undefined, client);

    const id = await createCategoryQuery(payload, client);
    const row = await getCategoryByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar la categoría creada.");
    }

    return mapCategoryListRow(row);
  });
}

export async function updateCategory(
  categoryId: number,
  input: UpdateCategoryInput
) {
  const payload = updateCategorySchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getCategoryByIdQuery(categoryId, client);

    if (!current) {
      const error = new Error("La categoría no existe.");
      Object.assign(error, { status: 404 });
      throw error;
    }

    if (payload.name !== undefined) {
      await ensureCategoryNameAvailableQuery(payload.name, categoryId, client);
    }

    const id = await updateCategoryQuery(categoryId, payload, client);
    const row = await getCategoryByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar la categoría actualizada.");
    }

    return mapCategoryListRow(row);
  });
}

export async function createSubcategory(input: CreateSubcategoryInput) {
  const payload = createSubcategorySchema.parse(input);

  return withTransaction(async (client) => {
    await ensureCategoryExistsQuery(payload.categoryId, client);
    await ensureSubcategoryNameAvailableQuery(
      payload.categoryId,
      payload.name,
      undefined,
      client
    );

    const id = await createSubcategoryQuery(payload, client);
    const row = await getSubcategoryByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar la subcategoría creada.");
    }

    return mapSubcategoryListRow(row);
  });
}

export async function updateSubcategory(
  subcategoryId: number,
  input: UpdateSubcategoryInput
) {
  const payload = updateSubcategorySchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getSubcategoryByIdQuery(subcategoryId, client);

    if (!current) {
      const error = new Error("La subcategoría no existe.");
      Object.assign(error, { status: 404 });
      throw error;
    }

    const targetCategoryId = Number(payload.categoryId ?? current.category_id);
    const targetName = payload.name ?? current.name;

    await ensureCategoryExistsQuery(targetCategoryId, client);
    await ensureSubcategoryNameAvailableQuery(
      targetCategoryId,
      targetName,
      subcategoryId,
      client
    );

    const id = await updateSubcategoryQuery(
      subcategoryId,
      {
        categoryId: payload.categoryId,
        name: payload.name,
      },
      client
    );

    const row = await getSubcategoryByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar la subcategoría actualizada.");
    }

    return mapSubcategoryListRow(row);
  });
}

export async function createService(input: CreateServiceInput) {
  const payload = createServiceSchema.parse(input);

  return withTransaction(async (client) => {
    await ensureServiceCodeAvailableQuery(payload.code, undefined, client);
    await ensureServiceNameAvailableQuery(payload.name, undefined, client);

    const id = await createServiceQuery(payload, client);
    const row = await getServiceByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar el servicio creado.");
    }

    return mapServiceListRow(row);
  });
}

export async function updateService(
  serviceId: number,
  input: UpdateServiceInput
) {
  const payload = updateServiceSchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getServiceByIdQuery(serviceId, client);

    if (!current) {
      const error = new Error("El servicio no existe.");
      Object.assign(error, { status: 404 });
      throw error;
    }

    if (payload.code !== undefined) {
      await ensureServiceCodeAvailableQuery(payload.code, serviceId, client);
    }

    if (payload.name !== undefined) {
      await ensureServiceNameAvailableQuery(payload.name, serviceId, client);
    }

    const id = await updateServiceQuery(serviceId, payload, client);
    const row = await getServiceByIdQuery(id, client);

    if (!row) {
      throw new Error("No se pudo recuperar el servicio actualizado.");
    }

    return mapServiceListRow(row);
  });
}