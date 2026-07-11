import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { TableColumn } from "@/features/backoffice/shared/types";

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  emptyState?: ReactNode;
  className?: string;
};

export function DataTable<T>({ columns, rows, getRowKey, emptyState, className }: DataTableProps<T>) {
  if (rows.length === 0) return <>{emptyState ?? null}</>;

  return (
    <div className={cn("overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_5px_24px_rgba(15,23,42,0.035)] dark:border-white/[0.075] dark:bg-[#101620]", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50/85 dark:bg-white/[0.025]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500", column.headerClassName)}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {rows.map((row, index) => (
              <tr key={getRowKey(row, index)} className="group transition-colors hover:bg-indigo-50/35 dark:hover:bg-indigo-500/[0.045]">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300", column.className)}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
