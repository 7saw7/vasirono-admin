"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AppIcon } from "@/components/ui/AppIcon";
import { ROUTES } from "@/lib/constants/routes";

type FormState = { email: string; password: string };
type FieldErrors = Partial<Record<keyof FormState, string>>;

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError("");
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!form.email.trim()) nextErrors.email = "El correo es obligatorio.";
    if (!form.password) nextErrors.password = "La contraseña es obligatoria.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setFormError("");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setFormError(payload.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.replace(ROUTES.BACKOFFICE_DASHBOARD);
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormError("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        name="email"
        type="email"
        label="Correo corporativo"
        placeholder="tu@vasirono.com"
        autoComplete="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        error={fieldErrors.email}
        leadingIcon={<AppIcon name="mail" className="h-[17px] w-[17px]" />}
      />

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-4">
          <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">Contraseña</label>
          <Link href={ROUTES.RECOVER_PASSWORD} className="text-[11px] font-bold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          error={fieldErrors.password}
          leadingIcon={<AppIcon name="lock" className="h-[17px] w-[17px]" />}
          trailingContent={(
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-lg p-1 text-[10px] font-bold text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/[0.06] dark:hover:text-indigo-300"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          )}
        />
      </div>

      {formError ? (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium leading-5 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
          <AppIcon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          {formError}
        </div>
      ) : null}

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        <AppIcon name="arrowUpRight" className="h-4 w-4" />
        Entrar al centro de control
      </Button>

      <Link
        href={ROUTES.RECOVER_PASSWORD}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:border-indigo-400/40 dark:hover:text-indigo-300"
      >
        <AppIcon name="key" className="h-4 w-4" />
        Olvidé mi contraseña
      </Link>
    </form>
  );
}
