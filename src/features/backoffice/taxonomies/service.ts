import { callBackofficeService } from "@/lib/microservices/backoffice-client";
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
import type {
  CreateBusinessTypeInput,
  CreateCategoryInput,
  CreateServiceInput,
  CreateSubcategoryInput,
  TaxonomiesDashboardFilters,
  TaxonomyListFilters,
  UpdateBusinessTypeInput,
  UpdateCategoryInput,
  UpdateServiceInput,
  UpdateSubcategoryInput,
} from "./types";

function unwrapData<T = unknown>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: T }).data;
  }

  return raw as T;
}

function paginationFallback(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const payload = value as Record<string, unknown>;
  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? (payload.pagination as Record<string, unknown>)
      : {};

  return {
    ...payload,
    items: payload.items ?? payload.rows ?? [],
    page: payload.page ?? pagination.page ?? 1,
    pageSize: payload.pageSize ?? pagination.pageSize ?? 10,
    total: payload.total ?? pagination.total ?? 0,
  };
}

function taxonomyPath(path = "") {
  const suffix = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `/api/companies/backoffice/taxonomies${suffix}`;
}

export async function getBusinessTypesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("business-types"),
    {
      query: {
        search: filters.search,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    },
  );

  return paginatedBusinessTypesSchema.parse(paginationFallback(unwrapData(raw)));
}

export async function getCategoriesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("categories"),
    {
      query: {
        search: filters.search,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    },
  );

  return paginatedCategoriesSchema.parse(paginationFallback(unwrapData(raw)));
}

export async function getSubcategoriesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("subcategories"),
    {
      query: {
        search: filters.search,
        categoryId: filters.categoryId,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    },
  );

  return paginatedSubcategoriesSchema.parse(paginationFallback(unwrapData(raw)));
}

export async function getServicesList(input: TaxonomyListFilters = {}) {
  const filters = taxonomyListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("services"),
    {
      query: {
        search: filters.search,
        active: filters.active,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    },
  );

  return paginatedServicesSchema.parse(paginationFallback(unwrapData(raw)));
}

export async function getTaxonomiesDashboard(
  input: TaxonomiesDashboardFilters = {},
) {
  const businessTypes = taxonomyListFiltersSchema.parse(input.businessTypes ?? {});
  const categories = taxonomyListFiltersSchema.parse(input.categories ?? {});
  const subcategories = taxonomyListFiltersSchema.parse(input.subcategories ?? {});
  const services = taxonomyListFiltersSchema.parse(input.services ?? {});

  const raw = await callBackofficeService<unknown>("companies", taxonomyPath(), {
    query: {
      btSearch: businessTypes.search,
      btPage: businessTypes.page,
      btPageSize: businessTypes.pageSize,
      catSearch: categories.search,
      catPage: categories.page,
      catPageSize: categories.pageSize,
      subSearch: subcategories.search,
      subCategoryId: subcategories.categoryId,
      subPage: subcategories.page,
      subPageSize: subcategories.pageSize,
      srvSearch: services.search,
      srvActive: services.active,
      srvPage: services.page,
      srvPageSize: services.pageSize,
    },
  });

  const data = unwrapData<Record<string, unknown>>(raw);
  return taxonomiesDashboardDataSchema.parse({
    ...data,
    businessTypes: paginationFallback(data.businessTypes),
    categories: paginationFallback(data.categories),
    subcategories: paginationFallback(data.subcategories),
    services: paginationFallback(data.services),
  });
}

export async function createBusinessType(input: CreateBusinessTypeInput) {
  const payload = createBusinessTypeSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("business-types"),
    { method: "POST", body: payload },
  );
  return unwrapData(raw);
}

export async function updateBusinessType(
  typeId: number,
  input: UpdateBusinessTypeInput,
) {
  const payload = updateBusinessTypeSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath(`business-types/${typeId}`),
    { method: "PATCH", body: payload },
  );
  return unwrapData(raw);
}

export async function createCategory(input: CreateCategoryInput) {
  const payload = createCategorySchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("categories"),
    { method: "POST", body: payload },
  );
  return unwrapData(raw);
}

export async function updateCategory(categoryId: number, input: UpdateCategoryInput) {
  const payload = updateCategorySchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath(`categories/${categoryId}`),
    { method: "PATCH", body: payload },
  );
  return unwrapData(raw);
}

export async function createSubcategory(input: CreateSubcategoryInput) {
  const payload = createSubcategorySchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("subcategories"),
    { method: "POST", body: payload },
  );
  return unwrapData(raw);
}

export async function updateSubcategory(
  subcategoryId: number,
  input: UpdateSubcategoryInput,
) {
  const payload = updateSubcategorySchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath(`subcategories/${subcategoryId}`),
    { method: "PATCH", body: payload },
  );
  return unwrapData(raw);
}

export async function createService(input: CreateServiceInput) {
  const payload = createServiceSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath("services"),
    { method: "POST", body: payload },
  );
  return unwrapData(raw);
}

export async function updateService(serviceId: number, input: UpdateServiceInput) {
  const payload = updateServiceSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    taxonomyPath(`services/${serviceId}`),
    { method: "PATCH", body: payload },
  );
  return unwrapData(raw);
}
