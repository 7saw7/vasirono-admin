"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PromotionForm } from "./PromotionForm";
import { PromotionsFilters } from "./PromotionsFilters";
import { PromotionsTable } from "./PromotionsTable";
import type {
  PromotionBranchOption,
  PromotionListItem,
  PromotionsDashboardData,
} from "@/features/backoffice/billing/types";

type PromotionsManagementClientProps = {
  data: PromotionsDashboardData;
  canManage: boolean;
  branchOptions: PromotionBranchOption[];
};

type Feedback =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

export function PromotionsManagementClient({
  data,
  canManage,
  branchOptions,
}: PromotionsManagementClientProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<PromotionListItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const initialValues = useMemo(() => {
    if (!editingItem) return undefined;

    return {
      title: editingItem.title,
      description: editingItem.description ?? "",
      discountPercent:
        editingItem.discountPercent !== null
          ? String(editingItem.discountPercent)
          : "",
      branchId: String(editingItem.branchId),
      active: editingItem.active ? "true" : "false",
      startDate: editingItem.startDate
        ? editingItem.startDate.slice(0, 10)
        : "",
      endDate: editingItem.endDate ? editingItem.endDate.slice(0, 10) : "",
    };
  }, [editingItem]);

  async function handleCreate(values: {
    title: string;
    description: string | null;
    discountPercent: number | null;
    branchId: number;
    active: boolean;
    startDate: string | null;
    endDate: string | null;
  }) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/backoffice/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No se pudo crear la promoción.");
      }

      setFeedback({
        type: "success",
        message: "Promoción creada correctamente.",
      });
      setShowCreateForm(false);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo crear la promoción.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(values: {
    title: string;
    description: string | null;
    discountPercent: number | null;
    branchId: number;
    active: boolean;
    startDate: string | null;
    endDate: string | null;
  }) {
    if (!editingItem) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/backoffice/promotions/${editingItem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No se pudo actualizar la promoción.");
      }

      setFeedback({
        type: "success",
        message: "Promoción actualizada correctamente.",
      });
      setEditingItem(null);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la promoción.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Promociones
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Gestión y seguimiento de promociones por empresa y sucursal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total promociones"
          value={String(data.summary.totalPromotions)}
        />
        <SummaryCard
          label="Activas"
          value={String(data.summary.activePromotions)}
        />
        <SummaryCard
          label="Usuarios asignados"
          value={String(data.summary.assignedUsers)}
        />
        <SummaryCard
          label="Usuarios redimidos"
          value={String(data.summary.redeemedUsers)}
        />
      </div>

      {canManage ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              setFeedback(null);
              setEditingItem(null);
              setShowCreateForm((current) => !current);
            }}
          >
            {showCreateForm ? "Cerrar formulario" : "Nueva promoción"}
          </Button>

          {editingItem ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingItem(null);
                setFeedback(null);
              }}
            >
              Cancelar edición
            </Button>
          ) : null}
        </div>
      ) : null}

      {canManage && showCreateForm && !editingItem ? (
        <PromotionForm
          mode="create"
          branchOptions={branchOptions}
          isSubmitting={isSubmitting}
          feedback={feedback}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowCreateForm(false);
            setFeedback(null);
          }}
        />
      ) : null}

      {canManage && editingItem ? (
        <PromotionForm
          mode="edit"
          branchOptions={branchOptions}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          feedback={feedback}
          onSubmit={handleUpdate}
          onCancel={() => {
            setEditingItem(null);
            setFeedback(null);
          }}
        />
      ) : null}

      <PromotionsFilters />

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>
          Mostrando {data.promotions.items.length} de {data.promotions.total} promociones
        </span>
        <span>
          Página {data.promotions.page} · {data.promotions.pageSize} por página
        </span>
      </div>

      <PromotionsTable
        data={data.promotions}
        canManage={canManage}
        onEdit={(item) => {
          setShowCreateForm(false);
          setFeedback(null);
          setEditingItem(item);
        }}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}