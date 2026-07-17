import Link from "next/link";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import type { PromotionsListResult } from "@/features/backoffice/promotions/types";

type PromotionsTableProps = {
  data: PromotionsListResult;
  showActions?: boolean;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(date);
}

export function PromotionsTable({ data, showActions = false }: PromotionsTableProps) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#101620] dark:text-slate-400">
        No se encontraron promociones con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.075] dark:bg-[#101620]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-white/[0.07]">
          <thead className="bg-slate-50 dark:bg-white/[0.025]">
            <tr>
              {[
                "Promoción",
                "Empresa / sucursal",
                "Estado",
                "Canjes",
                "Vigencia",
                "Acciones",
              ].map((label) => (
                <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.055]">
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.025]">
                <td className="px-4 py-4 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.discountPercent === null ? "Sin porcentaje" : `${item.discountPercent}% de descuento`}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  <p>{item.companyName}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.branchName}</p>
                </td>
                <td className="px-4 py-4"><PromotionStatusBadge status={item.status} /></td>
                <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">{item.redemptionsTotal}</span> redimidos
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.issuedCount} emitidos</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {formatDate(item.startDate)} — {formatDate(item.endDate)}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/promociones/${item.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
                  >
                    {showActions ? "Revisar" : "Ver detalle"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
