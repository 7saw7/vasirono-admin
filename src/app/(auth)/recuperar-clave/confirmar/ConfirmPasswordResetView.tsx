"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants/routes";

type State = "checking" | "valid" | "invalid" | "completed";

export function ConfirmPasswordResetView({ token }: { token: string }) {
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.history.replaceState(null, "", "/recuperar-clave/confirmar");
    if (!token) {
      setError("El enlace de recuperación no es válido.");
      setState("invalid");
      return;
    }

    fetch("/api/auth/recover-password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) throw new Error(payload.error || "El enlace no es válido o expiró.");
        setState("valid");
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "El enlace no es válido o expiró.");
        setState("invalid");
      });
  }, [token]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/recover-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "No se pudo cambiar la contraseña.");
      setState("completed");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-[#f7f8fc] px-5 py-14 dark:bg-[#080b12]">
      <section className="w-full max-w-xl rounded-[30px] border border-white/80 bg-white/90 p-7 shadow-[0_28px_90px_rgba(15,23,42,0.14)] dark:border-white/[0.08] dark:bg-[#10151f]/90 sm:p-9">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(145deg,#6d5dfc,#22d3ee)] text-white"><AppIcon name="lock" className="h-6 w-6" /></span>
        <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Nueva contraseña</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">El enlace expira y solo puede utilizarse una vez.</p>

        {state === "checking" ? <p className="mt-7 text-sm text-slate-500">Validando enlace…</p> : null}

        {state === "invalid" ? (
          <div className="mt-7 space-y-5">
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
            <Link href={ROUTES.RECOVER_PASSWORD} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white">Solicitar nuevo enlace</Link>
          </div>
        ) : null}

        {state === "valid" ? (
          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <Input name="password" type="password" label="Nueva contraseña" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} leadingIcon={<AppIcon name="lock" className="h-4 w-4" />} />
            <Input name="confirmation" type="password" label="Confirmar contraseña" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} leadingIcon={<AppIcon name="lock" className="h-4 w-4" />} />
            <p className="text-xs leading-5 text-slate-500">Mínimo 8 caracteres, con mayúscula, minúscula y número.</p>
            {error ? <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700" role="alert">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg" loading={loading}>Cambiar contraseña</Button>
          </form>
        ) : null}

        {state === "completed" ? (
          <div className="mt-7 space-y-5">
            <p className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><AppIcon name="check" className="h-5 w-5 shrink-0" />Contraseña actualizada y sesiones anteriores cerradas.</p>
            <Link href={ROUTES.LOGIN} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white">Iniciar sesión</Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
