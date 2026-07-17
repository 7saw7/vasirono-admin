import type { PromotionRedemption } from "@/features/backoffice/promotions/types";

export function PromotionUsersTable({ redemptions }: { redemptions: PromotionRedemption[] }) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.075] dark:bg-[#101620]">
      <header className="border-b border-slate-100 px-6 py-4 dark:border-white/[0.065]">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Usuarios y canjes</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Últimos 100 canjes emitidos, redimidos, vencidos o cancelados.</p>
      </header>
      {redemptions.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Esta promoción todavía no tiene canjes.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/[0.07]">
            <thead className="bg-slate-50 dark:bg-white/[0.025]"><tr>{["Usuario", "Código", "Estado", "Emitido", "Redimido"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.055]">
              {redemptions.map((item) => (
                <tr key={item.redemptionId}>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300"><p className="font-medium text-slate-900 dark:text-white">{item.userName || "Usuario"}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.userEmail || item.userId || "Sin identificación"}</p></td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">{item.redemptionCode || "—"}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{item.statusName || item.status}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{formatDateTime(item.issuedAt)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{formatDateTime(item.redeemedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha inválida" : new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
