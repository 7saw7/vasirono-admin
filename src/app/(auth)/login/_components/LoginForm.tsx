"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AppIcon } from "@/components/ui/AppIcon";
import { ROUTES } from "@/lib/constants/routes";
import type { MfaEnrollment, MfaPendingLoginResult } from "@/features/auth/types";

type FormState = { email: string; password: string };
type FieldErrors = Partial<Record<keyof FormState, string>>;
type Phase = "credentials" | "enrollment" | "verify" | "recovery";

type LoginApiResponse = {
  ok: boolean;
  error?: string;
  data?:
    | MfaPendingLoginResult
    | { status: "AUTHENTICATED"; user: unknown; session: unknown };
};

export function LoginForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("credentials");
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError("");
  }

  function validateCredentials() {
    const nextErrors: FieldErrors = {};
    if (!form.email.trim()) nextErrors.email = "El correo es obligatorio.";
    if (!form.password) nextErrors.password = "La contraseña es obligatoria.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function readPayload(response: Response) {
    return (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      data?: any;
    };
  }

  async function handleCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCredentials()) return;

    try {
      setIsSubmitting(true);
      setFormError("");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as LoginApiResponse;
      if (!response.ok || !payload.ok || !payload.data) {
        setFormError(payload.error ?? "No se pudo iniciar sesión.");
        return;
      }

      if (payload.data.status === "AUTHENTICATED") {
        finishLogin();
        return;
      }

      setChallengeId(payload.data.challengeId);
      setCode("");
      if (payload.data.enrollmentRequired) {
        const enrollResponse = await fetch("/api/auth/mfa/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId: payload.data.challengeId }),
        });
        const enrollPayload = await readPayload(enrollResponse);
        if (!enrollResponse.ok || !enrollPayload.ok || !enrollPayload.data) {
          setFormError(
            enrollPayload.error ?? "No se pudo preparar el autenticador.",
          );
          return;
        }
        setEnrollment(enrollPayload.data as MfaEnrollment);
        setPhase("enrollment");
      } else {
        setPhase("verify");
      }
    } catch (error) {
      console.error(error);
      setFormError("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) {
      setFormError("Ingresa el código del autenticador o uno de recuperación.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      const endpoint =
        phase === "enrollment"
          ? "/api/auth/mfa/confirm"
          : "/api/auth/mfa/verify";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code: code.trim() }),
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload.ok) {
        setFormError(payload.error ?? "El código no es válido.");
        return;
      }

      const codes = Array.isArray(payload.data?.recoveryCodes)
        ? payload.data.recoveryCodes.filter(
            (item: unknown): item is string => typeof item === "string",
          )
        : [];
      if (phase === "enrollment" && codes.length > 0) {
        setRecoveryCodes(codes);
        setPhase("recovery");
        return;
      }
      finishLogin();
    } catch (error) {
      console.error(error);
      setFormError("No se pudo completar la verificación MFA.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function finishLogin() {
    router.replace(ROUTES.BACKOFFICE_DASHBOARD);
    router.refresh();
  }

  async function copyRecoveryCodes() {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFormError("No se pudieron copiar automáticamente. Guárdalos manualmente.");
    }
  }

  function restart() {
    setPhase("credentials");
    setChallengeId("");
    setCode("");
    setEnrollment(null);
    setRecoveryCodes([]);
    setFormError("");
  }

  if (phase === "recovery") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-bold">Guarda tus códigos de recuperación</p>
          <p className="mt-1">
            Cada código funciona una sola vez. No volverán a mostrarse después de
            salir de esta pantalla.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100">
          {recoveryCodes.map((item) => (
            <code key={item} className="rounded-lg bg-white px-2 py-2 text-center shadow-sm dark:bg-white/[0.05]">
              {item}
            </code>
          ))}
        </div>
        {formError ? <ErrorMessage message={formError} /> : null}
        <Button type="button" variant="secondary" className="w-full" onClick={() => void copyRecoveryCodes()}>
          <AppIcon name="key" className="h-4 w-4" />
          {copied ? "Códigos copiados" : "Copiar códigos"}
        </Button>
        <Button type="button" className="w-full" size="lg" onClick={finishLogin}>
          Ya guardé los códigos
        </Button>
      </div>
    );
  }

  if (phase === "enrollment" || phase === "verify") {
    return (
      <form className="space-y-5" onSubmit={handleMfa}>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-xs leading-5 text-indigo-900 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-100">
          <p className="flex items-center gap-2 font-bold">
            <AppIcon name="shield" className="h-4 w-4" />
            {phase === "enrollment"
              ? "Activa la verificación en dos pasos"
              : "Verificación en dos pasos"}
          </p>
          <p className="mt-1">
            {phase === "enrollment"
              ? "Agrega esta cuenta en Google Authenticator, Microsoft Authenticator, Authy u otra aplicación TOTP."
              : "Ingresa el código de 6 dígitos de tu aplicación o un código de recuperación."}
          </p>
        </div>

        {phase === "enrollment" && enrollment ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cuenta</p>
              <p className="mt-1 break-all text-xs font-semibold text-slate-800 dark:text-slate-100">{enrollment.accountName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clave manual</p>
              <code className="mt-1 block break-all rounded-xl bg-white px-3 py-2 text-center text-sm font-bold tracking-[0.18em] text-indigo-700 shadow-sm dark:bg-white/[0.05] dark:text-indigo-200">
                {enrollment.secret}
              </code>
            </div>
            <details className="text-[11px] text-slate-500 dark:text-slate-400">
              <summary className="cursor-pointer font-semibold">Mostrar URI TOTP</summary>
              <p className="mt-2 break-all font-mono">{enrollment.otpauthUri}</p>
            </details>
          </div>
        ) : null}

        <Input
          name="mfaCode"
          label="Código de verificación"
          placeholder="123456"
          autoComplete="one-time-code"
          inputMode="text"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setFormError("");
          }}
          leadingIcon={<AppIcon name="key" className="h-4 w-4" />}
          hint="También puedes usar un código de recuperación."
          autoFocus
        />

        {formError ? <ErrorMessage message={formError} /> : null}

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          <AppIcon name="shield" className="h-4 w-4" />
          {phase === "enrollment" ? "Activar MFA y continuar" : "Verificar y entrar"}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={restart} disabled={isSubmitting}>
          Volver al inicio de sesión
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleCredentials}>
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

      {formError ? <ErrorMessage message={formError} /> : null}

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

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium leading-5 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
      <AppIcon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
