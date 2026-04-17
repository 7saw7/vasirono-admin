import {
  hideReviewInputSchema,
  hideReviewResultSchema,
  restoreReviewInputSchema,
  restoreReviewResultSchema,
  resolveReviewReportInputSchema,
  resolveReviewReportResultSchema,
  reviewDetailSchema,
  reviewsListFiltersSchema,
  reviewsListResultSchema,
} from "./schema";
import {
  mapHideReviewResultRow,
  mapResolveReviewReportResultRow,
  mapRestoreReviewResultRow,
  mapReviewDetailRow,
  mapReviewListRow,
} from "./mapper";
import type {
  HideReviewInput,
  ResolveReviewReportInput,
  RestoreReviewInput,
  ReviewsListFilters,
} from "./types";
import {
  getReviewByIdQuery,
  getReviewDetailQuery,
  getReviewMediaQuery,
  getReviewReportByIdQuery,
  getReviewReportStatusByCodeQuery,
  getReviewResponseQuery,
  getReviewUsefulnessQuery,
  hideReviewQuery,
  listReviewsQuery,
  resolveReviewReportQuery,
  restoreReviewQuery,
  resolveOpenReportsForReviewQuery,
} from "@/lib/db/queries/backoffice/reviews";
import { withTransaction } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";

export async function getReviewsList(input: ReviewsListFilters) {
  const filters = reviewsListFiltersSchema.parse(input);
  const result = await listReviewsQuery(filters);

  return reviewsListResultSchema.parse({
    items: result.rows.map(mapReviewListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getReviewDetail(reviewId: number) {
  const base = await getReviewDetailQuery(reviewId);
  if (!base) return null;

  const [media, response, usefulness] = await Promise.all([
    getReviewMediaQuery(reviewId),
    getReviewResponseQuery(reviewId),
    getReviewUsefulnessQuery(reviewId),
  ]);

  return reviewDetailSchema.parse(
    mapReviewDetailRow(base, {
      media,
      response,
      usefulness,
    })
  );
}

export async function hideReview(
  reviewId: number,
  actorUserId: string,
  input: HideReviewInput
) {
  const payload = hideReviewInputSchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getReviewByIdQuery(reviewId, client);

    if (!current) {
      throw new AppError("La reseña no existe.", 404, "REVIEW_NOT_FOUND");
    }

    if (current.is_hidden) {
      throw new AppError(
        "La reseña ya está oculta.",
        400,
        "REVIEW_ALREADY_HIDDEN"
      );
    }

    const updated = await hideReviewQuery(
      {
        reviewId,
        actorUserId,
        reason: payload.reason,
      },
      client
    );

    if (!updated) {
      throw new AppError(
        "No se pudo ocultar la reseña.",
        500,
        "REVIEW_HIDE_FAILED"
      );
    }
    
    const resolvedStatus = await getReviewReportStatusByCodeQuery("resolved", client);

    if (resolvedStatus) {
      await resolveOpenReportsForReviewQuery(
        {
          reviewId,
          actorUserId,
          statusId: Number(resolvedStatus.id),
          resolutionNotes:
            "Reporte resuelto automáticamente porque la reseña fue ocultada por moderación.",
        },
        client
      );
    }
    return hideReviewResultSchema.parse(mapHideReviewResultRow(updated));
  });
}

export async function restoreReview(
  reviewId: number,
  _actorUserId: string,
  input: RestoreReviewInput = {}
) {
  restoreReviewInputSchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getReviewByIdQuery(reviewId, client);

    if (!current) {
      throw new AppError("La reseña no existe.", 404, "REVIEW_NOT_FOUND");
    }

    if (!current.is_hidden) {
      throw new AppError(
        "La reseña ya está visible.",
        400,
        "REVIEW_ALREADY_VISIBLE"
      );
    }

    const updated = await restoreReviewQuery(
      {
        reviewId,
      },
      client
    );

    if (!updated) {
      throw new AppError(
        "No se pudo restaurar la reseña.",
        500,
        "REVIEW_RESTORE_FAILED"
      );
    }

    return restoreReviewResultSchema.parse(mapRestoreReviewResultRow(updated));
  });
}

export async function resolveReviewReport(
  reportId: number,
  actorUserId: string,
  input: ResolveReviewReportInput
) {
  const payload = resolveReviewReportInputSchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getReviewReportByIdQuery(reportId, client);

    if (!current) {
      throw new AppError(
        "El reporte no existe.",
        404,
        "REVIEW_REPORT_NOT_FOUND"
      );
    }

    const targetCode =
      payload.resolution === "resolved" ? "resolved" : "dismissed";

    const targetStatus = await getReviewReportStatusByCodeQuery(
      targetCode,
      client
    );

    if (!targetStatus) {
      throw new AppError(
        `No existe el estado requerido: ${targetCode}.`,
        500,
        "REVIEW_REPORT_STATUS_NOT_FOUND"
      );
    }

    const updated = await resolveReviewReportQuery(
      {
        reportId,
        statusId: Number(targetStatus.id),
        actorUserId,
        resolutionNotes: payload.resolutionNotes ?? null,
      },
      client
    );

    if (!updated) {
      throw new AppError(
        "No se pudo resolver el reporte.",
        500,
        "REVIEW_REPORT_RESOLVE_FAILED"
      );
    }

    return resolveReviewReportResultSchema.parse(
      mapResolveReviewReportResultRow(updated)
    );
  });
}