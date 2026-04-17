import { z } from "zod";

export const taxonomyEntitySchema = z.enum([
  "business-types",
  "categories",
  "subcategories",
  "services",
]);

export const taxonomyListFiltersSchema = z.object({
  entity: taxonomyEntitySchema.optional(),
  search: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  active: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const businessTypeListItemSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable(),
  companiesCount: z.number().int(),
});

export const categoryListItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  subcategoriesCount: z.number().int(),
  companiesCount: z.number().int(),
});

export const subcategoryListItemSchema = z.object({
  id: z.number().int(),
  categoryId: z.number().int(),
  categoryName: z.string(),
  name: z.string(),
  companiesCount: z.number().int(),
});

export const serviceListItemSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  isActive: z.boolean(),
  branchesCount: z.number().int(),
});

export const paginatedBusinessTypesSchema = z.object({
  items: z.array(businessTypeListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const paginatedCategoriesSchema = z.object({
  items: z.array(categoryListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const paginatedSubcategoriesSchema = z.object({
  items: z.array(subcategoryListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const paginatedServicesSchema = z.object({
  items: z.array(serviceListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const taxonomyDashboardSummarySchema = z.object({
  totalBusinessTypes: z.number().int(),
  totalCategories: z.number().int(),
  totalSubcategories: z.number().int(),
  totalServices: z.number().int(),
});

export const taxonomiesDashboardDataSchema = z.object({
  summary: taxonomyDashboardSummarySchema,
  businessTypes: paginatedBusinessTypesSchema,
  categories: paginatedCategoriesSchema,
  subcategories: paginatedSubcategoriesSchema,
  services: paginatedServicesSchema,
});

export const taxonomyIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createBusinessTypeSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const updateBusinessTypeSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
  })
  .refine((value) => value.name !== undefined, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
  })
  .refine((value) => value.name !== undefined, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export const createSubcategorySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(120),
});

export const updateSubcategorySchema = z
  .object({
    categoryId: z.coerce.number().int().positive().optional(),
    name: z.string().trim().min(2).max(120).optional(),
  })
  .refine(
    (value) => value.categoryId !== undefined || value.name !== undefined,
    {
      message: "Debes enviar al menos un campo para actualizar.",
    }
  );

export const createServiceSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(
      /^[a-z0-9_]+$/,
      "El código solo puede contener minúsculas, números y guion bajo."
    ),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  icon: z.string().trim().max(120).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(
        /^[a-z0-9_]+$/,
        "El código solo puede contener minúsculas, números y guion bajo."
      )
      .optional(),
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    icon: z.string().trim().max(120).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.code !== undefined ||
      value.name !== undefined ||
      value.description !== undefined ||
      value.icon !== undefined ||
      value.isActive !== undefined,
    {
      message: "Debes enviar al menos un campo para actualizar.",
    }
  );