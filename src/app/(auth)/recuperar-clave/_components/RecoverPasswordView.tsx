import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { AppIcon } from "@/components/ui/AppIcon";

export function RecoverPasswordView() {
  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f7f8fc] dark:bg-[#080b12]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(99,102,241,0.17),transparent_34%),radial-gradient(circle_at_88%_15%,rgba(34,211,238,0.09),transparent_28%)] dark:bg-[radial-gradient(circle_at_16%_20%,rgba(99,102,241,0.2),transparent_34%),radial-gradient(circle_at_88%_15%,rgba(34,211,238,0.08),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-[1180px] place-items-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-xl rounded-[30px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#10151f]/90 dark:shadow-[0_30px_100px_rgba(0,0,0,0.48)] sm:p-9">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(145deg,#6d5dfc,#22d3ee)] text-white shadow-[0_15px_38px_rgba(99,102,241,0.32)]">
            <AppIcon name="key" className="h-6 w-6" />
          </span>
          <span className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <AppIcon name="alert" className="h-3 w-3" /> Integración pendiente
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] text-slate-950 dark:text-white">Recuperar acceso</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            La interfaz está preparada, pero el envío real de recuperación todavía requiere un endpoint seguro de autenticación y validación de token.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs leading-5 text-amber-800 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-200">
            Habilita este flujo cuando estén disponibles la solicitud de recuperación, la expiración controlada y la confirmación segura de la nueva contraseña.
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href={ROUTES.LOGIN} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#6d5dfc,#4f46e5)] px-5 text-xs font-bold text-white shadow-[0_9px_24px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5">
              <AppIcon name="chevronRight" className="h-4 w-4 rotate-180" /> Volver al login
            </Link>
            <Link href={ROUTES.HOME} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:border-indigo-400/40 dark:hover:text-indigo-300">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
