"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

type PlanFormProps = {
  plan?: { id: number; name: string };
  compact?: boolean;
};

type State = { kind: "idle" | "saving" | "success" | "error"; message?: string };

async function savePlan(planId: number | undefined, name: string) {
  const response = await fetch(
    planId ? `/api/backoffice/plans/${planId}` : "/api/backoffice/plans",
    {
      method: planId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(
      String(
        payload?.error?.message ??
          payload?.error ??
          payload?.message ??
          "No se pudo guardar el plan.",
      ),
    );
  }
  return payload?.data ?? payload;
}

export function PlanForm({ plan, compact = false }: PlanFormProps) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") ?? "").trim();
    if (name.length < 2) {
      setState({ kind: "error", message: "El nombre debe tener al menos 2 caracteres." });
      return;
    }

    setState({ kind: "saving" });
    try {
      await savePlan(plan?.id, name);
      setState({
        kind: "success",
        message: plan ? "Plan actualizado." : "Plan creado correctamente.",
      });
      if (!plan) formElement.reset();
      router.refresh();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar el plan.",
      });
    }
  }

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? "flex min-w-[280px] items-end gap-2"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.025]"
      }
    >
      <div className={compact ? "min-w-0 flex-1" : "grid gap-4 md:grid-cols-[1fr_auto] md:items-end"}>
        <Select
          name="name"
          label={plan ? "Nombre canónico" : "Nuevo plan canónico"}
          defaultValue={plan?.name ?? ""}
          placeholder="Selecciona un plan"
          options={[
            { value: "Free", label: "Free" },
            { value: "Pro", label: "Pro" },
            { value: "Premium", label: "Premium" },
          ]}
          required
          hint={!compact ? "Los códigos comerciales son canónicos. Precios y referencias de pasarela se configuran mediante Billing Service y variables seguras." : undefined}
        />
        <Button type="submit" size={compact ? "sm" : "md"} loading={state.kind === "saving"}>
          {plan ? "Guardar" : "Crear plan"}
        </Button>
      </div>
      {state.message ? (
        <p className={`mt-2 text-xs ${state.kind === "error" ? "text-rose-600" : "text-emerald-600"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
