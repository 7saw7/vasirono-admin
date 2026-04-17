import type {
  BusinessTypeListItem,
  CategoryListItem,
  ServiceListItem,
  SubcategoryListItem,
} from "./types";

export type BusinessTypeListRow = {
  id: number | string;
  name: string | null;
  companies_count: number | string | null;
};

export type CategoryListRow = {
  id: number | string;
  name: string;
  subcategories_count: number | string | null;
  companies_count: number | string | null;
};

export type SubcategoryListRow = {
  id: number | string;
  category_id: number | string;
  category_name: string;
  name: string;
  companies_count: number | string | null;
};

export type ServiceListRow = {
  id: number | string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  branches_count: number | string | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function mapBusinessTypeListRow(
  row: BusinessTypeListRow
): BusinessTypeListItem {
  return {
    id: toNumber(row.id),
    name: row.name,
    companiesCount: toNumber(row.companies_count),
  };
}

export function mapCategoryListRow(row: CategoryListRow): CategoryListItem {
  return {
    id: toNumber(row.id),
    name: row.name,
    subcategoriesCount: toNumber(row.subcategories_count),
    companiesCount: toNumber(row.companies_count),
  };
}

export function mapSubcategoryListRow(
  row: SubcategoryListRow
): SubcategoryListItem {
  return {
    id: toNumber(row.id),
    categoryId: toNumber(row.category_id),
    categoryName: row.category_name,
    name: row.name,
    companiesCount: toNumber(row.companies_count),
  };
}

export function mapServiceListRow(row: ServiceListRow): ServiceListItem {
  return {
    id: toNumber(row.id),
    code: row.code,
    name: row.name,
    description: row.description,
    icon: row.icon,
    isActive: row.is_active,
    branchesCount: toNumber(row.branches_count),
  };
}