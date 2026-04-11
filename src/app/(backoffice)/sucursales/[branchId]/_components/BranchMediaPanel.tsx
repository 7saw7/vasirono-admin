import { SectionCard } from "@/components/ui/SectionCard";
import type { BranchDetailMedia } from "@/features/backoffice/branches/types";

type BranchMediaPanelProps = {
  media: BranchDetailMedia[];
};

export function BranchMediaPanel({ media }: BranchMediaPanelProps) {
  return (
    <SectionCard
      title="Media"
      description="Imágenes o recursos multimedia de la sucursal."
    >
      {media.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay media registrada.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <article
              key={item.mediaId}
              className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50"
            >
              <div className="aspect-[16/10] bg-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.mediaType ?? "Media de sucursal"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-4">
                <p className="text-sm font-medium text-neutral-900">
                  {item.mediaType ?? "Media"}
                </p>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  {item.url}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}