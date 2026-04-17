"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type PromotionFormMode = "create" | "edit";

export type PromotionFormValues = {
  title: string;
  description: string;
  discountPercent: string;
  branchId: string;
  active: string;
  startDate: string;
  endDate: string;
};

type BranchOption = {
  label: string;
  value: number;
};

type PromotionFormProps = {
  mode?: PromotionFormMode;
  branchOptions: BranchOption[];
  initialValues?: Partial<PromotionFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  feedback?: {
    type: "success" | "error";
    message: string;
  } | null;
  onSubmit: (values: {
    title: string;
    description: string | null;
    discountPercent: number | null;
    branchId: number;
    active: boolean;
    startDate: string | null;
    endDate: string | null;
  }) => Promise<void> | void;
  onCancel?: () => void;
};

type FormErrors = Partial<Record<keyof PromotionFormValues, string>>;

const defaultValues: PromotionFormValues = {
  title: "",
  description: "",
  discountPercent: "",
  branchId: "",
  active: "true",
  startDate: "",
  endDate: "",
};

export function PromotionForm({
  mode = "create",
  branchOptions,
  initialValues,
  isSubmitting = false,
  submitLabel,
  feedback = null,
  onSubmit,
  onCancel,
}: PromotionFormProps) {
  const [form, setForm] = useState<PromotionFormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof PromotionFormValues, boolean>>
  >({});

  useEffect(() => {
    setForm({
      ...defaultValues,
      ...initialValues,
    });
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const title =
    mode === "create" ? "Crear promoción" : "Editar promoción";

  const description =
    mode === "create"
      ? "Define una promoción asociada a una sucursal y controla su vigencia."
      : "Actualiza los campos operativos de la promoción.";

  const ctaLabel =
    submitLabel ??
    (mode === "create" ? "Guardar promoción" : "Guardar cambios");

  function validate(values: PromotionFormValues): FormErrors {
    const nextErrors: FormErrors = {};

    const trimmedTitle = values.title.trim();
    const trimmedDescription = values.description.trim();
    const trimmedDiscount = values.discountPercent.trim();

    if (!trimmedTitle) {
      nextErrors.title = "El título es obligatorio.";
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = "El título debe tener al menos 3 caracteres.";
    } else if (trimmedTitle.length > 140) {
      nextErrors.title = "El título no puede superar los 140 caracteres.";
    }

    if (trimmedDescription.length > 1000) {
      nextErrors.description =
        "La descripción no puede superar los 1000 caracteres.";
    }

    if (!values.branchId) {
      nextErrors.branchId = "Debes seleccionar una sucursal.";
    }

    if (trimmedDiscount) {
      const discount = Number(trimmedDiscount);

      if (!Number.isFinite(discount)) {
        nextErrors.discountPercent = "El descuento debe ser numérico.";
      } else if (discount < 0 || discount > 100) {
        nextErrors.discountPercent =
          "El descuento debe estar entre 0 y 100.";
      }
    }

    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);

      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        nextErrors.endDate =
          "La fecha de fin no puede ser menor que la fecha de inicio.";
      }
    }

    return nextErrors;
  }

  const computedErrors = useMemo(() => validate(form), [form]);
  const isFormValid = Object.keys(computedErrors).length === 0;

  function updateField<K extends keyof PromotionFormValues>(
    key: K,
    value: PromotionFormValues[K]
  ) {
    const nextForm = {
      ...form,
      [key]: value,
    };

    setForm(nextForm);

    if (touched[key]) {
      setErrors(validate(nextForm));
    }
  }

  function touchField<K extends keyof PromotionFormValues>(key: K) {
    setTouched((current) => ({
      ...current,
      [key]: true,
    }));
    setErrors(validate(form));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched({
      title: true,
      description: true,
      discountPercent: true,
      branchId: true,
      startDate: true,
      endDate: true,
      active: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      discountPercent: form.discountPercent.trim()
        ? Number(form.discountPercent)
        : null,
      branchId: Number(form.branchId),
      active: form.active === "true",
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    });
  }

  return (
    <SectionCard title={title} description={description}>
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            name="title"
            label="Título"
            placeholder="Ej. 20% en menú ejecutivo"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            onBlur={() => touchField("title")}
            error={touched.title ? errors.title : undefined}
          />

          <Input
            name="discountPercent"
            type="number"
            min="0"
            max="100"
            step="0.01"
            label="Descuento (%)"
            placeholder="Ej. 15"
            value={form.discountPercent}
            onChange={(event) =>
              updateField("discountPercent", event.target.value)
            }
            onBlur={() => touchField("discountPercent")}
            error={touched.discountPercent ? errors.discountPercent : undefined}
            hint="Opcional. Déjalo vacío si la promoción no se expresa como porcentaje."
          />
        </div>

        <Textarea
          name="description"
          label="Descripción"
          placeholder="Describe el alcance, condiciones o notas de la promoción..."
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          onBlur={() => touchField("description")}
          error={touched.description ? errors.description : undefined}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Select
            name="branchId"
            label="Sucursal"
            value={form.branchId}
            onChange={(event) => updateField("branchId", event.target.value)}
            onBlur={() => touchField("branchId")}
            options={branchOptions}
            placeholder="Selecciona una sucursal"
            error={touched.branchId ? errors.branchId : undefined}
          />

          <Select
            name="active"
            label="Estado"
            value={form.active}
            onChange={(event) => updateField("active", event.target.value)}
            options={[
              { label: "Activa", value: "true" },
              { label: "Inactiva", value: "false" },
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            name="startDate"
            type="date"
            label="Fecha de inicio"
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            onBlur={() => touchField("startDate")}
            error={touched.startDate ? errors.startDate : undefined}
          />

          <Input
            name="endDate"
            type="date"
            label="Fecha de fin"
            value={form.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
            onBlur={() => touchField("endDate")}
            error={touched.endDate ? errors.endDate : undefined}
          />
        </div>

        {feedback ? (
          <div
            className={
              feedback.type === "success"
                ? "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                : "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            }
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={isSubmitting} disabled={!isFormValid}>
            {ctaLabel}
          </Button>

          {onCancel ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>
    </SectionCard>
  );
}