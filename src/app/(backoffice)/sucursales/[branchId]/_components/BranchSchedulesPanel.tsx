import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchDetailSchedule } from "@/features/backoffice/branches/types";

type BranchSchedulesPanelProps = {
  schedules: BranchDetailSchedule[];
};

export function BranchSchedulesPanel({ schedules }: BranchSchedulesPanelProps) {
  return (
    <SectionCard
      title="Horarios"
      description="Horarios base configurados para la sucursal."
    >
      {schedules.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay horarios registrados.</p>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <article
              key={schedule.scheduleId}
              className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-100 p-4"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {schedule.dayName}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Turno {schedule.shiftNumber}
                </p>
              </div>

              <p className="text-sm text-neutral-700">
                {schedule.opening ?? "—"} - {schedule.closing ?? "—"}
              </p>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}