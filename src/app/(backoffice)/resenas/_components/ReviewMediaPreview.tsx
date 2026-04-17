import type { ReviewMediaItem } from "@/features/backoffice/reviews/types";

type ReviewMediaPreviewProps = {
  media: ReviewMediaItem[];
};

export function ReviewMediaPreview({ media }: ReviewMediaPreviewProps) {
  if (media.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-500">
        Esta reseña no tiene media adjunta.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {media.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={`Media ${item.id}`}
            className="h-48 w-full object-cover"
          />
          <div className="border-t border-neutral-200 px-3 py-2 text-xs text-neutral-500">
            {item.mediaType ?? "Media"} {item.isCover ? "· Cover" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}