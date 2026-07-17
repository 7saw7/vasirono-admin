"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Props = {
  page: number;
  pageSize: number;
  total: number;
};

export function PromotionsPagination({ page, pageSize, total }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));
    router.push(`/promociones?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-white/[0.075] dark:bg-[#101620]">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Página <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
          Anterior
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
