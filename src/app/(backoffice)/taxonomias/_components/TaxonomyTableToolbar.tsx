"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type TaxonomyTableToolbarProps = {
  searchKey: string;
  pageKey: string;
  searchPlaceholder: string;
  createLabel: string;
  onCreate: () => void;
  extraFilters?: Array<{
    key: string;
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
  }>;
};

export function TaxonomyTableToolbar({
  searchKey,
  pageKey,
  searchPlaceholder,
  createLabel,
  onCreate,
  extraFilters = [],
}: TaxonomyTableToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get(searchKey) ?? "";

  const filterValues = useMemo(() => {
    return Object.fromEntries(
      extraFilters.map((filter) => [filter.key, searchParams.get(filter.key) ?? ""])
    ) as Record<string, string>;
  }, [extraFilters, searchParams]);

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete(pageKey);
    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Input
          label="Buscar"
          placeholder={searchPlaceholder}
          defaultValue={currentSearch}
          onBlur={(event) =>
            updateParams({
              [searchKey]: event.target.value.trim() || null,
            })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const target = event.currentTarget as HTMLInputElement;
              updateParams({
                [searchKey]: target.value.trim() || null,
              });
            }
          }}
        />

        {extraFilters.map((filter) => (
          <Select
            key={filter.key}
            label={filter.label}
            value={filterValues[filter.key] ?? ""}
            options={filter.options}
            onChange={(event) =>
              updateParams({
                [filter.key]: event.target.value || null,
              })
            }
          />
        ))}
      </div>

      <div className="flex items-end justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onCreate()}
          disabled={isPending}
        >
          {createLabel}
        </Button>
      </div>
    </div>
  );
}