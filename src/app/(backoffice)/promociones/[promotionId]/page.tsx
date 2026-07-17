import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBackofficePage } from "@/lib/auth/page-guard";
import { BackofficeServiceError } from "@/lib/microservices/backoffice-client";
import { getAdminPromotionDetail } from "@/features/backoffice/promotions/service";
import { promotionIdParamSchema } from "@/features/backoffice/promotions/schema";
import { PromotionStatusBadge } from "../_components/PromotionStatusBadge";
import { PromotionUsersTable } from "../_components/PromotionUsersTable";
import { PromotionModerationClient } from "./_components/PromotionModerationClient";

type PageProps = { params: Promise<{ promotionId: string }> };

export const dynamic = "force-dynamic";

export default async function PromotionDetailPage({ params }: PageProps) {
  const context = await requireBackofficePage("promotions.read");
  const parsed = promotionIdParamSchema.parse(await params);

  let promotion;
  try {
    promotion = await getAdminPromotionDetail(parsed.promotionId);
  } catch (error) {
    if (error instanceof BackofficeServiceError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/promociones" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
            ← Volver a promociones
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{promotion.title}</h1>
            <PromotionStatusBadge status={promotion.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {promotion.companyName} · {promotion.branchName}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Empresa" value={`${promotion.companyName} (#${promotion.companyId})`} />
        <Metric label="Sucursal" value={`${promotion.branchName} (#${promotion.branchId})`} />
        <Metric label="Emitidos" value={String(promotion.issuedCount)} />
        <Metric label="Redimidos" value={String(promotion.redemptionsTotal)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <section className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.075] dark:bg-[#101620]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Detalle comercial</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <Detail label="Descripción" value={promotion.description ?? "Sin descripción"} wide />
            <Detail label="Términos" value={promotion.terms ?? "Sin términos registrados"} wide />
            <Detail label="Descuento" value={promotion.discountPercent === null ? "No aplica" : `${promotion.discountPercent}%`} />
            <Detail label="Vigencia" value={`${formatDate(promotion.startDate)} — ${formatDate(promotion.endDate)}`} />
            <Detail label="Máximo de canjes" value={promotion.maxRedemptions === null ? "Sin límite" : String(promotion.maxRedemptions)} />
            <Detail label="Canjes por usuario" value={String(promotion.maxRedemptionsPerUser)} />
            <Detail label="Validación por personal" value={promotion.requiresStaffValidation ? "Requerida" : "No requerida"} />
            <Detail label="Disponibilidad pública" value={promotion.isPubliclyAvailable ? "Visible" : "No visible"} />
          </dl>
        </section>

        <PromotionModerationClient
          promotionId={promotion.id}
          status={promotion.status}
          canModerate={context.hasPermission("promotions.moderate")}
          canUpdateStatus={context.hasPermission("promotions.updateStatus")}
        />
      </div>

      <PromotionUsersTable redemptions={promotion.redemptions} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/[0.075] dark:bg-[#101620]"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{value}</p></div>;
}

function Detail({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "sm:col-span-2" : ""}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-200">{value}</dd></div>;
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha inválida" : new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(date);
}
