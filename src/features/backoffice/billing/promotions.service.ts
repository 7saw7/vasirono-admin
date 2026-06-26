import {
  billingListFiltersSchema,
  createPromotionSchema,
  promotionBranchOptionSchema,
  promotionsDashboardDataSchema,
  promotionsListResultSchema,
  updatePromotionSchema,
} from "./schema";
import type {
  BillingListFilters,
  CreatePromotionInput,
  PromotionBranchOption,
  PromotionListItem,
  PromotionSummary,
  UpdatePromotionInput,
} from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";
import { callBilling, filtersQuery, paginatedPayload, unwrapPayload } from "./service-helpers";

function mapPromotionItem(raw: unknown): PromotionListItem {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: Number(item.id ?? item.promotionId ?? 0),
    title: String(item.title ?? "Sin título"),
    description: item.description === undefined ? null : item.description === null ? null : String(item.description),
    discountPercent: item.discountPercent === undefined && item.discount_percent === undefined ? null : item.discountPercent === null || item.discount_percent === null ? null : Number(item.discountPercent ?? item.discount_percent),
    startDate: item.startDate === undefined && item.start_date === undefined ? null : item.startDate === null || item.start_date === null ? null : String(item.startDate ?? item.start_date),
    endDate: item.endDate === undefined && item.end_date === undefined ? null : item.endDate === null || item.end_date === null ? null : String(item.endDate ?? item.end_date),
    active: Boolean(item.active ?? item.isActive ?? false),
    branchId: Number(item.branchId ?? item.branch_id ?? 0),
    branchName: String(item.branchName ?? item.branch_name ?? "Sin sucursal"),
    companyId: Number(item.companyId ?? item.company_id ?? 0),
    companyName: String(item.companyName ?? item.company_name ?? "Sin empresa"),
    assignedUsers: Number(item.assignedUsers ?? item.usersCount ?? item.users_count ?? 0),
    redeemedUsers: Number(item.redeemedUsers ?? item.redeemedCount ?? item.redeemed_count ?? 0),
  };
}

function mapPromotionSummary(raw: unknown, items: PromotionListItem[], total: number): PromotionSummary {
  const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
  const summary =
    typeof payload.summary === "object" && payload.summary !== null
      ? (payload.summary as Record<string, unknown>)
      : payload;
  return {
    totalPromotions: Number(summary.totalPromotions ?? summary.total_promotions ?? summary.total ?? total ?? 0),
    activePromotions: Number(summary.activePromotions ?? summary.active_promotions ?? summary.active ?? items.filter((item) => item.active).length),
    assignedUsers: Number(summary.assignedUsers ?? summary.assigned_users ?? items.reduce((acc, item) => acc + item.assignedUsers, 0)),
    redeemedUsers: Number(summary.redeemedUsers ?? summary.redeemed_users ?? items.reduce((acc, item) => acc + item.redeemedUsers, 0)),
  };
}

export async function getPromotionsList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const raw = await callBilling<unknown>("/promotions", { query: filtersQuery(filters) });
  const pageData = paginatedPayload(raw);
  return promotionsListResultSchema.parse({
    items: pageData.items.map(mapPromotionItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
}

export async function getPromotionsDashboard(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const [promotionsRaw, summaryRaw] = await Promise.all([
    callBilling<unknown>("/promotions", { query: filtersQuery(filters) }),
    callBilling<unknown>("/promotions/dashboard").catch(() => null),
  ]);
  const pageData = paginatedPayload(promotionsRaw);
  const promotions = promotionsListResultSchema.parse({
    items: pageData.items.map(mapPromotionItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
  const summary = mapPromotionSummary(summaryRaw, promotions.items, promotions.total);
  return promotionsDashboardDataSchema.parse({ promotions, summary });
}

export async function getPromotionBranchOptions(): Promise<PromotionBranchOption[]> {
  const raw = await callBackofficeService<unknown>("branches", "/api/backoffice/branches", {
    query: { page: 1, pageSize: 100 },
  }).catch(() => null);

  if (!raw) return [];
  const pageData = paginatedPayload(raw);
  return pageData.items
    .map((rawItem) => {
      const item = (rawItem && typeof rawItem === "object" ? rawItem : {}) as Record<string, unknown>;
      return promotionBranchOptionSchema.parse({
        value: Number(item.branchId ?? item.branch_id ?? item.id ?? 0),
        label: `${String(item.name ?? item.branchName ?? "Sucursal")} · ${String(item.companyName ?? item.company_name ?? "Empresa")}`,
      });
    })
    .filter((option) => option.value > 0);
}

export async function createPromotion(input: CreatePromotionInput) {
  const payload = createPromotionSchema.parse(input);
  const raw = await callBackofficeService<unknown>("promotions", "/api/promotions/admin/promotions", {
    method: "POST",
    body: payload,
  });
  return mapPromotionItem(raw);
}

export async function updatePromotion(promotionId: number, input: UpdatePromotionInput) {
  const payload = updatePromotionSchema.parse(input);
  const raw = await callBackofficeService<unknown>("promotions", `/api/promotions/admin/promotions/${promotionId}`, {
    method: "PATCH",
    body: payload,
  });
  return mapPromotionItem(raw);
}
