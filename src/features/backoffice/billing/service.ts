import {
  billingListFiltersSchema,
  createPromotionSchema,
  promotionBranchOptionSchema,
  promotionsDashboardDataSchema,
  promotionsListResultSchema,
  updatePromotionSchema,
} from "./schema";
import {
  mapPromotionBranchOptionRow,
  mapPromotionListRow,
} from "./mapper";
import type {
  BillingListFilters,
  CreatePromotionInput,
  UpdatePromotionInput,
} from "./types";
import {
  createPromotionQuery,
  getPromotionByIdQuery,
  getPromotionsSummaryQuery,
  listPromotionBranchOptionsQuery,
  listPromotionsQuery,
  updatePromotionQuery,
} from "@/lib/db/queries/backoffice/billing";
import { withTransaction } from "@/lib/db/server";

export async function getPromotionsList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const result = await listPromotionsQuery(filters);

  return promotionsListResultSchema.parse({
    items: result.rows.map(mapPromotionListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getPromotionsDashboard(
  input: BillingListFilters = {}
) {
  const filters = billingListFiltersSchema.parse(input);

  const [promotionsResult, summaryRow] = await Promise.all([
    listPromotionsQuery(filters),
    getPromotionsSummaryQuery(filters),
  ]);

  return promotionsDashboardDataSchema.parse({
    promotions: {
      items: promotionsResult.rows.map(mapPromotionListRow),
      page: promotionsResult.page,
      pageSize: promotionsResult.pageSize,
      total: promotionsResult.total,
    },
    summary: {
      totalPromotions: Number(summaryRow.total_promotions ?? 0),
      activePromotions: Number(summaryRow.active_promotions ?? 0),
      assignedUsers: Number(summaryRow.assigned_users ?? 0),
      redeemedUsers: Number(summaryRow.redeemed_users ?? 0),
    },
  });
}

export async function getPromotionBranchOptions() {
  const rows = await listPromotionBranchOptionsQuery();

  return rows.map((row) =>
    promotionBranchOptionSchema.parse(mapPromotionBranchOptionRow(row))
  );
}

export async function createPromotion(input: CreatePromotionInput) {
  const payload = createPromotionSchema.parse(input);

  return withTransaction(async (client) => {
    const promotionId = await createPromotionQuery(payload, client);
    const row = await getPromotionByIdQuery(promotionId, client);

    if (!row) {
      throw new Error("No se pudo recuperar la promoción creada.");
    }

    return mapPromotionListRow(row);
  });
}

export async function updatePromotion(
  promotionId: number,
  input: UpdatePromotionInput
) {
  const payload = updatePromotionSchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getPromotionByIdQuery(promotionId, client);

    if (!current) {
      const error = new Error("La promoción no existe.");
      Object.assign(error, { status: 404 });
      throw error;
    }

    await updatePromotionQuery(promotionId, payload, client);

    const row = await getPromotionByIdQuery(promotionId, client);

    if (!row) {
      throw new Error("No se pudo recuperar la promoción actualizada.");
    }

    return mapPromotionListRow(row);
  });
}