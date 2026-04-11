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

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-neutral-200 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500",
                    column.headerClassName
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="border-t border-neutral-100"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 text-sm text-neutral-700", column.className)}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? "—")}
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