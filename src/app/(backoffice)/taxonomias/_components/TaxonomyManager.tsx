"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessTypesTable } from "./BusinessTypesTable";
import { CategoriesTable } from "./CategoriesTable";
import { ServicesTable } from "./ServicesTable";
import { SubcategoriesTable } from "./SubcategoriesTable";
import { TaxonomiesFilters } from "./TaxonomiesFilters";
import { TaxonomyForms } from "./TaxonomyForms";
import type {
  BusinessTypeListItem,
  CategoryListItem,
  ServiceListItem,
  SubcategoryListItem,
  TaxonomiesDashboardData,
  TaxonomyEntity,
} from "@/features/backoffice/taxonomies/types";

type TaxonomyManagerProps = {
  data: TaxonomiesDashboardData;
};

type EditableTaxonomyItem =
  | BusinessTypeListItem
  | CategoryListItem
  | SubcategoryListItem
  | ServiceListItem
  | null;

export function TaxonomyManager({ data }: TaxonomyManagerProps) {
  const router = useRouter();

  const [entity, setEntity] = useState<TaxonomyEntity>("business-types");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<EditableTaxonomyItem>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const categoryOptions = useMemo(
    () =>
      data.categories.items.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [data.categories.items]
  );

  function startCreate(nextEntity?: TaxonomyEntity) {
    if (nextEntity) setEntity(nextEntity);
    setMode("create");
    setEditingItem(null);
    setFeedback(null);
  }

  function startEdit(
    nextEntity: TaxonomyEntity,
    item: EditableTaxonomyItem
  ) {
    setEntity(nextEntity);
    setMode("edit");
    setEditingItem(item);
    setFeedback(null);
  }

  async function handleSubmit(payload: Record<string, unknown>) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const isEdit = mode === "edit" && editingItem && "id" in editingItem;
      const endpoint = isEdit
        ? `/api/backoffice/taxonomies/${entity}/${editingItem.id}`
        : `/api/backoffice/taxonomies/${entity}`;

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "No se pudo guardar el cambio en taxonomías."
        );
      }

      setFeedback({
        type: "success",
        message:
          mode === "create"
            ? "Registro creado correctamente."
            : "Registro actualizado correctamente.",
      });

      setMode("create");
      setEditingItem(null);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <TaxonomiesFilters />

      <TaxonomyForms
        entity={entity}
        mode={mode}
        editingItem={editingItem}
        categoryOptions={categoryOptions}
        isSubmitting={isSubmitting}
        feedback={feedback}
        onEntityChange={(value) => {
          setEntity(value);
          setMode("create");
          setEditingItem(null);
          setFeedback(null);
        }}
        onCancelEdit={() => startCreate(entity)}
        onStartCreate={startCreate}
        onSubmit={handleSubmit}
      />

      <BusinessTypesTable
        data={data.businessTypes}
        onCreate={() => startCreate("business-types")}
        onEdit={(item) => startEdit("business-types", item)}
      />

      <CategoriesTable
        data={data.categories}
        onCreate={() => startCreate("categories")}
        onEdit={(item) => startEdit("categories", item)}
      />

      <SubcategoriesTable
        data={data.subcategories}
        categories={data.categories}
        onCreate={() => startCreate("subcategories")}
        onEdit={(item) => startEdit("subcategories", item)}
      />

      <ServicesTable
        data={data.services}
        onCreate={() => startCreate("services")}
        onEdit={(item) => startEdit("services", item)}
      />
    </div>
  );
}