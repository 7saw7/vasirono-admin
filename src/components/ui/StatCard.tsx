import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: string;
  action?: ReactNode;
};

export function StatCard({ title, value, subtitle, action }: StatCardProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <div className="text-2xl font-semibold text-neutral-950">{value}</div>
          {subtitle ? (
            <p className="text-sm text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </section>
  );
}