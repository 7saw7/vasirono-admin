"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

type TaxonomyPaginationProps = {
  pageKey: string;
  currentPage: number;
  pageSize: number;
  total: number;
};

export function TaxonomyPagination({
  pageKey,
  currentPage,
  pageSize,
  total,
}: TaxonomyPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canGoBack = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  function goToPage(page: number) {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const params = new URLSearchParams(searchParams.toString());

    if (safePage <= 1) {
      params.delete(pageKey);
    } else {
      params.set(pageKey, String(safePage));
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  if (total <= pageSize) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-neutral-500">
        Página {currentPage} de {totalPages} · {total} registros
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => goToPage(currentPage - 1)}
          disabled={!canGoBack || isPending}
        >
          Anterior
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => goToPage(currentPage + 1)}
          disabled={!canGoNext || isPending}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}