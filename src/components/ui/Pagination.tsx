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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-neutral-500">
        Página {page} de {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canGoPrev}
          onClick={() => onPageChange?.(page - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange?.(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}