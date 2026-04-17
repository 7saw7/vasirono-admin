"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import type {
  BusinessTypeListItem,
  CategoryListItem,
  ServiceListItem,
  SubcategoryListItem,
  TaxonomyEntity,
} from "@/features/backoffice/taxonomies/types";

type EditableTaxonomyItem =
  | BusinessTypeListItem
  | CategoryListItem
  | SubcategoryListItem
  | ServiceListItem
  | null;

type TaxonomyFormsProps = {
  entity: TaxonomyEntity;
  mode: "create" | "edit";
  editingItem: EditableTaxonomyItem;
  categoryOptions: Array<{ label: string; value: number }>;
  isSubmitting: boolean;
  feedback: {
    type: "success" | "error";
    message: string;
  } | null;
  onEntityChange: (entity: TaxonomyEntity) => void;
  onCancelEdit: () => void;
  onStartCreate: (entity?: TaxonomyEntity) => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
};

type FormState = {
  name: string;
  code: string;
  description: string;
  icon: string;
  categoryId: string;
  isActive: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type PendingConfirmation =
  | {
      kind: "service-disable";
      title: string;
      message: string;
      payload: Record<string, unknown>;
      confirmLabel: string;
    }
  | {
      kind: "subcategory-category-change";
      title: string;
      message: string;
      payload: Record<string, unknown>;
      confirmLabel: string;
    }
  | null;

const entityOptions = [
  { label: "Tipos de negocio", value: "business-types" },
  { label: "Categorías", value: "categories" },
  { label: "Subcategorías", value: "subcategories" },
  { label: "Servicios", value: "services" },
] as const;

const initialFormState: FormState = {
  name: "",
  code: "",
  description: "",
  icon: "",
  categoryId: "",
  isActive: "true",
};

export function TaxonomyForms({
  entity,
  mode,
  editingItem,
  categoryOptions,
  isSubmitting,
  feedback,
  onEntityChange,
  onCancelEdit,
  onStartCreate,
  onSubmit,
}: TaxonomyFormsProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>(
    {}
  );
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation>(null);

  const title = useMemo(() => {
    const prefix = mode === "create" ? "Crear" : "Editar";

    switch (entity) {
      case "business-types":
        return `${prefix} tipo de negocio`;
      case "categories":
        return `${prefix} categoría`;
      case "subcategories":
        return `${prefix} subcategoría`;
      case "services":
        return `${prefix} servicio`;
    }
  }, [entity, mode]);

  useEffect(() => {
    if (mode === "edit" && editingItem) {
      if ("code" in editingItem) {
        setForm({
          name: editingItem.name,
          code: editingItem.code,
          description: editingItem.description ?? "",
          icon: editingItem.icon ?? "",
          categoryId: "",
          isActive: editingItem.isActive ? "true" : "false",
        });
        setErrors({});
        setTouched({});
        setPendingConfirmation(null);
        return;
      }

      if ("categoryId" in editingItem) {
        setForm({
          name: editingItem.name,
          code: "",
          description: "",
          icon: "",
          categoryId: String(editingItem.categoryId),
          isActive: "true",
        });
        setErrors({});
        setTouched({});
        setPendingConfirmation(null);
        return;
      }

      setForm({
        name: editingItem.name ?? "",
        code: "",
        description: "",
        icon: "",
        categoryId: "",
        isActive: "true",
      });
      setErrors({});
      setTouched({});
      setPendingConfirmation(null);
      return;
    }

    setForm(initialFormState);
    setErrors({});
    setTouched({});
    setPendingConfirmation(null);
  }, [mode, editingItem, entity]);

  const serviceIsBeingDisabled =
    entity === "services" &&
    mode === "edit" &&
    editingItem !== null &&
    "code" in editingItem &&
    editingItem.isActive === true &&
    form.isActive === "false";

  const subcategoryCategoryIsChanging =
    entity === "subcategories" &&
    mode === "edit" &&
    editingItem !== null &&
    "categoryId" in editingItem &&
    form.categoryId !== "" &&
    Number(form.categoryId) !== editingItem.categoryId;

  function normalizeCode(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }

  function validate(current: FormState): FormErrors {
    const nextErrors: FormErrors = {};

    const trimmedName = current.name.trim();
    const trimmedCode = current.code.trim();
    const trimmedDescription = current.description.trim();
    const trimmedIcon = current.icon.trim();

    if (!trimmedName) {
      nextErrors.name = "El nombre es obligatorio.";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "El nombre debe tener al menos 2 caracteres.";
    } else if (trimmedName.length > 120) {
      nextErrors.name = "El nombre no puede superar los 120 caracteres.";
    }

    if (entity === "subcategories") {
      if (!current.categoryId) {
        nextErrors.categoryId = "Debes seleccionar una categoría.";
      }
    }

    if (entity === "services") {
      if (!trimmedCode) {
        nextErrors.code = "El código es obligatorio.";
      } else if (trimmedCode.length < 2) {
        nextErrors.code = "El código debe tener al menos 2 caracteres.";
      } else if (trimmedCode.length > 80) {
        nextErrors.code = "El código no puede superar los 80 caracteres.";
      } else if (!/^[a-z0-9_]+$/.test(trimmedCode)) {
        nextErrors.code =
          "El código solo puede contener minúsculas, números y guion bajo.";
      }

      if (trimmedDescription.length > 500) {
        nextErrors.description =
          "La descripción no puede superar los 500 caracteres.";
      }

      if (trimmedIcon.length > 120) {
        nextErrors.icon = "El ícono no puede superar los 120 caracteres.";
      }
    }

    return nextErrors;
  }

  const computedErrors = useMemo(() => validate(form), [form, entity]);
  const isFormValid = Object.keys(computedErrors).length === 0;

  function setFieldTouched<K extends keyof FormState>(key: K) {
    setTouched((current) => ({
      ...current,
      [key]: true,
    }));
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    const normalizedValue =
      key === "code" && typeof value === "string"
        ? (normalizeCode(value) as FormState[K])
        : value;

    const nextForm = {
      ...form,
      [key]: normalizedValue,
    };

    setForm(nextForm);
    setPendingConfirmation(null);

    if (touched[key]) {
      setErrors(validate(nextForm));
    }
  }

  function handleEntityChange(value: TaxonomyEntity) {
    onEntityChange(value);
    setErrors({});
    setTouched({});
    setPendingConfirmation(null);
  }

  function handleClear() {
    setForm(initialFormState);
    setErrors({});
    setTouched({});
    setPendingConfirmation(null);
    onStartCreate(entity);
  }

  function buildPayload() {
    const payload: Record<string, unknown> = {};

    if (entity === "business-types" || entity === "categories") {
      payload.name = form.name.trim();
    }

    if (entity === "subcategories") {
      payload.name = form.name.trim();
      payload.categoryId = Number(form.categoryId);
    }

    if (entity === "services") {
      payload.code = normalizeCode(form.code);
      payload.name = form.name.trim();
      payload.description = form.description.trim() || null;
      payload.icon = form.icon.trim() || null;
      payload.isActive = form.isActive === "true";
    }

    return payload;
  }

  async function submitDirectly(payload: Record<string, unknown>) {
    await onSubmit(payload);
    setPendingConfirmation(null);
  }

  function buildSensitiveConfirmation(
    payload: Record<string, unknown>
  ): PendingConfirmation {
    if (serviceIsBeingDisabled) {
      return {
        kind: "service-disable",
        title: "Confirmar desactivación del servicio",
        message:
          "Este cambio puede afectar catálogos operativos y relaciones futuras con sucursales. Confirma solo si el servicio ya no debe seguir disponible.",
        payload,
        confirmLabel: "Sí, desactivar servicio",
      };
    }

    if (subcategoryCategoryIsChanging) {
      return {
        kind: "subcategory-category-change",
        title: "Confirmar cambio de categoría",
        message:
          "Estás moviendo una subcategoría existente a otra categoría. Antes de guardar, verifica que el cambio siga teniendo sentido para las empresas que ya usan esta taxonomía.",
        payload,
        confirmLabel: "Sí, cambiar categoría",
      };
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched({
      name: true,
      code: true,
      description: true,
      icon: true,
      categoryId: true,
      isActive: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = buildPayload();
    const confirmation = buildSensitiveConfirmation(payload);

    if (confirmation) {
      setPendingConfirmation(confirmation);
      return;
    }

    await submitDirectly(payload);
  }

  const visibleErrors: FormErrors = {
    name: touched.name ? errors.name ?? computedErrors.name : undefined,
    code: touched.code ? errors.code ?? computedErrors.code : undefined,
    description: touched.description
      ? errors.description ?? computedErrors.description
      : undefined,
    icon: touched.icon ? errors.icon ?? computedErrors.icon : undefined,
    categoryId: touched.categoryId
      ? errors.categoryId ?? computedErrors.categoryId
      : undefined,
  };

  return (
    <SectionCard
      title={title}
      description="Usa este panel para crear o editar registros de taxonomías sin salir del dashboard."
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <Select
            label="Catálogo"
            value={entity}
            options={entityOptions.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            onChange={(event) =>
              handleEntityChange(event.target.value as TaxonomyEntity)
            }
          />

          <div className="flex flex-wrap items-end gap-2">
            <StatusBadge
              label={mode === "create" ? "Modo creación" : "Modo edición"}
              tone={mode === "create" ? "info" : "warning"}
            />
            {mode === "edit" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancelEdit}
              >
                Cancelar edición
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onStartCreate(entity)}
              >
                Nuevo registro
              </Button>
            )}
          </div>
        </div>

        {feedback ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {serviceIsBeingDisabled ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Estás desactivando un servicio existente. Este cambio requerirá confirmación antes de guardarse.
          </div>
        ) : null}

        {subcategoryCategoryIsChanging ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Estás cambiando la categoría de una subcategoría existente. Este cambio requerirá confirmación antes de guardarse.
          </div>
        ) : null}

        {pendingConfirmation ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-900">
                {pendingConfirmation.title}
              </p>
              <p className="text-sm text-amber-800">
                {pendingConfirmation.message}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                loading={isSubmitting}
                onClick={() => submitDirectly(pendingConfirmation.payload)}
              >
                {pendingConfirmation.confirmLabel}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setPendingConfirmation(null)}
              >
                Revisar cambios
              </Button>
            </div>
          </div>
        ) : null}

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <Input
              label="Nombre"
              placeholder="Ingresa el nombre"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              onBlur={() => {
                setFieldTouched("name");
                setErrors(validate(form));
              }}
              required
              aria-invalid={visibleErrors.name ? "true" : "false"}
            />
            {visibleErrors.name ? (
              <p className="text-xs text-red-600">{visibleErrors.name}</p>
            ) : null}
          </div>

          {entity === "subcategories" ? (
            <div className="space-y-1">
              <Select
                label="Categoría"
                value={form.categoryId}
                placeholder="Selecciona una categoría"
                options={categoryOptions}
                onChange={(event) =>
                  updateField("categoryId", event.target.value)
                }
                onBlur={() => {
                  setFieldTouched("categoryId");
                  setErrors(validate(form));
                }}
                required
                aria-invalid={visibleErrors.categoryId ? "true" : "false"}
              />
              {visibleErrors.categoryId ? (
                <p className="text-xs text-red-600">{visibleErrors.categoryId}</p>
              ) : null}
            </div>
          ) : null}

          {entity === "services" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Input
                    label="Código"
                    placeholder="delivery_express"
                    value={form.code}
                    onChange={(event) => updateField("code", event.target.value)}
                    onBlur={() => {
                      setFieldTouched("code");
                      setErrors(validate(form));
                    }}
                    required
                    aria-invalid={visibleErrors.code ? "true" : "false"}
                  />
                  {visibleErrors.code ? (
                    <p className="text-xs text-red-600">{visibleErrors.code}</p>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Se normaliza automáticamente a minúsculas y guion bajo.
                    </p>
                  )}
                </div>

                <Select
                  label="Estado"
                  value={form.isActive}
                  options={[
                    { label: "Activo", value: "true" },
                    { label: "Inactivo", value: "false" },
                  ]}
                  onChange={(event) =>
                    updateField("isActive", event.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Input
                  label="Ícono"
                  placeholder="truck, phone, map-pin..."
                  value={form.icon}
                  onChange={(event) => updateField("icon", event.target.value)}
                  onBlur={() => {
                    setFieldTouched("icon");
                    setErrors(validate(form));
                  }}
                  aria-invalid={visibleErrors.icon ? "true" : "false"}
                />
                {visibleErrors.icon ? (
                  <p className="text-xs text-red-600">{visibleErrors.icon}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <Textarea
                  label="Descripción"
                  placeholder="Describe el servicio"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  onBlur={() => {
                    setFieldTouched("description");
                    setErrors(validate(form));
                  }}
                  aria-invalid={visibleErrors.description ? "true" : "false"}
                />
                <div className="flex items-center justify-between gap-3">
                  {visibleErrors.description ? (
                    <p className="text-xs text-red-600">
                      {visibleErrors.description}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Máximo 500 caracteres.
                    </p>
                  )}
                  <p className="text-xs text-neutral-400">
                    {form.description.trim().length}/500
                  </p>
                </div>
              </div>
            </>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!isFormValid || pendingConfirmation !== null}
            >
              {mode === "create" ? "Guardar" : "Actualizar"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              disabled={isSubmitting}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </div>
    </SectionCard>
  );
}