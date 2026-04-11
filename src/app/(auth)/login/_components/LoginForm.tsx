"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants/routes";

type FormState = {
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError("");
  }

  function validate() {
    const nextErrors: FieldErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "El correo es obligatorio.";
    }

    if (!form.password) {
      nextErrors.password = "La contraseña es obligatoria.";
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

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
        label="Correo"
        placeholder="tu@vasirono.com"
        autoComplete="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        error={fieldErrors.email}
      />

      <Input
        name="password"
        type="password"
        label="Contraseña"
        placeholder="********"
        autoComplete="current-password"
        value={form.password}
        onChange={(event) => updateField("password", event.target.value)}
        error={fieldErrors.password}
      />

      {formError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        Entrar al backoffice
      </Button>
    </form>
  );
}