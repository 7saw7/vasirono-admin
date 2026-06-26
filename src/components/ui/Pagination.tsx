"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./Button";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const canGoPrev = safePage > 1;
  const canGoNext = safePage < totalPages;

  function goToPage(nextPage: number) {
    const targetPage = Math.min(Math.max(1, nextPage), totalPages);

    if (onPageChange) {
      onPageChange(targetPage);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    params.set("pageSize", String(pageSize));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-neutral-500">
        Página {safePage} de {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canGoPrev}
          onClick={() => goToPage(safePage - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canGoNext}
          onClick={() => goToPage(safePage + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
