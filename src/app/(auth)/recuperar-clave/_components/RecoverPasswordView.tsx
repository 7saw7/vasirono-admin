"use client";

import Link from "next/link";
import { useState } from "react";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants/routes";

export function RecoverPasswordView() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "No se pudo procesar la solicitud.");
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f7f8fc] dark:bg-[#080b12]">
      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-[1180px] place-items-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-xl rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.14)] dark:border-white/[0.08] dark:bg-[#10151f]/90 sm:p-9">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(145deg,#6d5dfc,#22d3ee)] text-white">
            <AppIcon name="key" className="h-6 w-6" />
          </span>
          <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Recuperar acceso</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Te enviaremos un enlace personal y de un solo uso para crear una nueva contraseña.
          </p>

          {sent ? (
            <div className="mt-7 space-y-5">
              <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <AppIcon name="check" className="mt-0.5 h-5 w-5 shrink-0" />
                Si el correo existe, recibirás un enlace de recuperación. Revisa también spam.
              </div>
              <button type="button" onClick={() => setSent(false)} className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Solicitar otro enlace</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              <Input
                name="email"
                type="email"
                label="Correo corporativo"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                leadingIcon={<AppIcon name="mail" className="h-4 w-4" />}
              />
              {error ? <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700" role="alert">{error}</p> : null}
              <Button type="submit" className="w-full" size="lg" loading={loading}>Enviar enlace seguro</Button>
            </form>
          )}

          <Link href={ROUTES.LOGIN} className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-300">
            <AppIcon name="chevronRight" className="h-4 w-4 rotate-180" /> Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
