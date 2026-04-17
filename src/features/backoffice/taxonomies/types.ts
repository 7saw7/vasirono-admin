import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type TaxonomyEntity =
  | "business-types"
  | "categories"
  | "subcategories"
  | "services";

export type TaxonomyListFilters = {
  entity?: TaxonomyEntity;
  search?: string;
  categoryId?: string | number;
  active?: string | boolean;
  page?: string | number;
  pageSize?: string | number;
};

export type BusinessTypeListItem = {
  id: number;
  name: string | null;
  companiesCount: number;
};

export type CategoryListItem = {
  id: number;
  name: string;
  subcategoriesCount: number;
  companiesCount: number;
};

export type SubcategoryListItem = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  companiesCount: number;
};

export type ServiceListItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  branchesCount: number;
};

export type TaxonomyDashboardSummary = {
  totalBusinessTypes: number;
  totalCategories: number;
  totalSubcategories: number;
  totalServices: number;
};

export type TaxonomiesDashboardData = {
  summary: TaxonomyDashboardSummary;
  businessTypes: PaginatedResult<BusinessTypeListItem>;
  categories: PaginatedResult<CategoryListItem>;
  subcategories: PaginatedResult<SubcategoryListItem>;
  services: PaginatedResult<ServiceListItem>;
};

export type CreateBusinessTypeInput = {
  name: string;
};

export type UpdateBusinessTypeInput = {
  name?: string;
};

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = {
  name?: string;
};

export type CreateSubcategoryInput = {
  categoryId: number;
  name: string;
};

export type UpdateSubcategoryInput = {
  categoryId?: number;
  name?: string;
};

export type CreateServiceInput = {
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
};

export type UpdateServiceInput = {
  code?: string;
  name?: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
};

export type TaxonomyScopedListFilters = {
  search?: string;
  categoryId?: string | number;
  active?: string | boolean;
  page?: string | number;
  pageSize?: string | number;
};

export type TaxonomiesDashboardFilters = {
  businessTypes?: TaxonomyScopedListFilters;
  categories?: TaxonomyScopedListFilters;
  subcategories?: TaxonomyScopedListFilters;
  services?: TaxonomyScopedListFilters;
};