"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/ui/SectionCard";
import type { CompanyDetail } from "@/features/backoffice/companies/types";
import type {
  BusinessTypeListItem,
  SubcategoryListItem,
} from "@/features/backoffice/taxonomies/types";

type Props = {
  company: CompanyDetail;
  taxonomyAvailable: boolean;
  businessTypes: BusinessTypeListItem[];
  subcategories: SubcategoryListItem[];
};

type ActionState = { kind: "idle" | "saving" | "success" | "error"; message?: string };

async function patch(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    const message =
      payload?.error?.message ?? payload?.error ?? payload?.message ?? "No se pudo completar la operación.";
    throw new Error(String(message));
  }
  return payload?.data ?? payload;
}

function optionalText(form: FormData, key: string): string | null {
  const value = String(form.get(key) ?? "").trim();
  return value.length ? value : null;
}

function optionalNumber(form: FormData, key: string): number | null {
  const value = String(form.get(key) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CompanyManagementPanel({ company, taxonomyAvailable, businessTypes, subcategories }: Props) {
  const router = useRouter();
  const [profileState, setProfileState] = useState<ActionState>({ kind: "idle" });
  const [taxonomyState, setTaxonomyState] = useState<ActionState>({ kind: "idle" });
  const [statusState, setStatusState] = useState<ActionState>({ kind: "idle" });
  const [selectedTypes, setSelectedTypes] = useState<Set<number>>(
    () => new Set(company.businessTypes.map((item) => item.typeId)),
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<number>>(
    () => new Set(company.subcategories.map((item) => item.subcategoryId)),
  );

  const currentSubcategoryPrices = useMemo(
    () => new Map(company.subcategories.map((item) => [item.subcategoryId, item.priceId])),
    [company.subcategories],
  );

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileState({ kind: "saving" });
    const form = new FormData(event.currentTarget);
    try {
      await patch(`/api/backoffice/companies/${company.companyId}/profile`, {
        name: String(form.get("name") ?? "").trim(),
        description: optionalText(form, "description"),
        address: optionalText(form, "address"),
        phone: optionalText(form, "phone"),
        email: optionalText(form, "email"),
        website: optionalText(form, "website"),
        lat: optionalNumber(form, "lat"),
        lon: optionalNumber(form, "lon"),
      });
      setProfileState({ kind: "success", message: "Perfil actualizado correctamente." });
      router.refresh();
    } catch (error) {
      setProfileState({ kind: "error", message: error instanceof Error ? error.message : "No se pudo actualizar." });
    }
  }

  async function saveTaxonomy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTaxonomyState({ kind: "saving" });
    try {
      await patch(`/api/backoffice/companies/${company.companyId}/taxonomy`, {
        businessTypeIds: [...selectedTypes],
        subcategories: [...selectedSubcategories].map((subcategoryId) => ({
          subcategoryId,
          priceId: currentSubcategoryPrices.get(subcategoryId) ?? null,
        })),
      });
      setTaxonomyState({ kind: "success", message: "Taxonomía actualizada correctamente." });
      router.refresh();
    } catch (error) {
      setTaxonomyState({ kind: "error", message: error instanceof Error ? error.message : "No se pudo actualizar." });
    }
  }

  async function changeStatus() {
    const next = !company.isActive;
    const accepted = window.confirm(
      next
        ? "¿Confirmas que deseas activar esta empresa?"
        : "¿Confirmas que deseas desactivar esta empresa? Sus perfiles públicos podrían dejar de mostrarse.",
    );
    if (!accepted) return;
    setStatusState({ kind: "saving" });
    try {
      await patch(`/api/backoffice/companies/${company.companyId}/status`, { isActive: next });
      setStatusState({ kind: "success", message: next ? "Empresa activada." : "Empresa desactivada." });
      router.refresh();
    } catch (error) {
      setStatusState({ kind: "error", message: error instanceof Error ? error.message : "No se pudo cambiar el estado." });
    }
  }

  return (
    <SectionCard
      title="Administración de empresa"
      description="Cambios controlados sobre perfil, estado y clasificación comercial."
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Estado operativo</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Estado actual: <span className={company.isActive ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>{company.isActive ? "Activa" : "Inactiva"}</span>
            </p>
            <StateMessage state={statusState} />
          </div>
          <button
            type="button"
            onClick={changeStatus}
            disabled={statusState.kind === "saving"}
            className={company.isActive
              ? "rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
              : "rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"}
          >
            {statusState.kind === "saving" ? "Procesando…" : company.isActive ? "Desactivar empresa" : "Activar empresa"}
          </button>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Perfil principal</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Los cambios se guardan en Companies Service.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="name" label="Nombre" defaultValue={company.name} required />
            <Field name="email" label="Correo" defaultValue={company.email ?? ""} type="email" />
            <Field name="phone" label="Teléfono" defaultValue={company.phone ?? ""} />
            <Field name="website" label="Sitio web" defaultValue={company.website ?? ""} />
            <Field name="address" label="Dirección" defaultValue={company.address ?? ""} className="md:col-span-2" />
            <Field name="lat" label="Latitud" defaultValue={company.lat ?? ""} type="number" step="any" />
            <Field name="lon" label="Longitud" defaultValue={company.lon ?? ""} type="number" step="any" />
          </div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Descripción
            <textarea name="description" defaultValue={company.description ?? ""} rows={4} maxLength={1500} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-white/[0.1] dark:bg-white/[0.035] dark:text-white" />
          </label>
          <div className="flex items-center justify-between gap-4">
            <StateMessage state={profileState} />
            <button disabled={profileState.kind === "saving"} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
              {profileState.kind === "saving" ? "Guardando…" : "Guardar perfil"}
            </button>
          </div>
        </form>

        {taxonomyAvailable ? (
        <form onSubmit={saveTaxonomy} className="space-y-4 border-t border-slate-200 pt-7 dark:border-white/[0.08]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clasificación comercial</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Selecciona los tipos de negocio y subcategorías vinculados.</p>
          </div>
          <OptionGrid
            title="Tipos de negocio"
            items={businessTypes.map((item) => ({ id: item.id, label: item.name ?? `Tipo ${item.id}` }))}
            selected={selectedTypes}
            onToggle={(id) => setSelectedTypes(toggleSet(selectedTypes, id))}
          />
          <OptionGrid
            title="Subcategorías"
            items={subcategories.map((item) => ({ id: item.id, label: `${item.categoryName} · ${item.name}` }))}
            selected={selectedSubcategories}
            onToggle={(id) => setSelectedSubcategories(toggleSet(selectedSubcategories, id))}
          />
          <div className="flex items-center justify-between gap-4">
            <StateMessage state={taxonomyState} />
            <button disabled={taxonomyState.kind === "saving"} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
              {taxonomyState.kind === "saving" ? "Guardando…" : "Guardar clasificación"}
            </button>
          </div>
        </form>
        ) : (
          <div className="border-t border-slate-200 pt-7 dark:border-white/[0.08]">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Clasificación comercial</p>
            <p className="mt-2 text-xs leading-5 text-amber-600 dark:text-amber-300">El catálogo de taxonomías no está disponible o el rol actual no tiene permiso de lectura. No se habilita la edición para evitar eliminar asociaciones existentes.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function toggleSet(current: Set<number>, id: number) {
  const next = new Set(current);
  if (next.has(id)) next.delete(id); else next.add(id);
  return next;
}

function Field({ name, label, defaultValue, type = "text", required, step, className = "" }: { name: string; label: string; defaultValue: string | number; type?: string; required?: boolean; step?: string; className?: string }) {
  return <label className={`block text-xs font-semibold text-slate-600 dark:text-slate-300 ${className}`}>{label}<input name={name} type={type} step={step} required={required} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-white/[0.1] dark:bg-white/[0.035] dark:text-white" /></label>;
}

function OptionGrid({ title, items, selected, onToggle }: { title: string; items: Array<{ id: number; label: string }>; selected: Set<number>; onToggle: (id: number) => void }) {
  return <fieldset><legend className="text-xs font-bold text-slate-700 dark:text-slate-200">{title}</legend><div className="mt-3 grid max-h-56 gap-2 overflow-y-auto rounded-2xl border border-slate-200 p-3 dark:border-white/[0.08] sm:grid-cols-2 xl:grid-cols-3">{items.length ? items.map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.04]"><input type="checkbox" checked={selected.has(item.id)} onChange={() => onToggle(item.id)} className="mt-0.5" /><span>{item.label}</span></label>) : <p className="text-xs text-slate-500">No hay opciones disponibles.</p>}</div></fieldset>;
}

function StateMessage({ state }: { state: ActionState }) {
  if (!state.message) return <span />;
  return <p className={`text-xs ${state.kind === "error" ? "text-rose-600" : "text-emerald-600"}`}>{state.message}</p>;
}
