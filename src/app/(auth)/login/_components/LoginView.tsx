import { LoginForm } from "./LoginForm";
import { AppIcon } from "@/components/ui/AppIcon";
import { BrandMark } from "@/components/ui/BrandMark";

const operationalMetrics = [
  { label: "Empresas activas", value: "120+", icon: "building" as const, tone: "text-indigo-600 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  { label: "Sucursales", value: "480+", icon: "branches" as const, tone: "text-fuchsia-600 dark:text-fuchsia-300", bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10" },
  { label: "Operación", value: "24/7", icon: "activity" as const, tone: "text-emerald-600 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
];

export function LoginView() {
  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f7f8fc] dark:bg-[#080b12]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_90%_5%,rgba(34,211,238,0.1),transparent_28%),radial-gradient(circle_at_65%_90%,rgba(217,70,239,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_15%_25%,rgba(99,102,241,0.2),transparent_34%),radial-gradient(circle_at_90%_5%,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_65%_90%,rgba(217,70,239,0.08),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.38] [background-image:linear-gradient(rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:36px_36px] dark:opacity-[0.16]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-[1440px] items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-16 xl:gap-20">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 shadow-sm backdrop-blur dark:border-indigo-400/20 dark:bg-white/[0.04] dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.7)]" />
            Vasirono intelligence center
          </div>

          <h1 className="mt-7 max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] text-slate-950 dark:text-white xl:text-[64px]">
            Toda la operación,
            <span className="block bg-[linear-gradient(90deg,#6d5dfc,#8b5cf6,#22d3ee)] bg-clip-text text-transparent">en una sola vista.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
            Supervisa empresas, verificaciones, reseñas, ingresos y actividad de la plataforma con una experiencia clara, rápida y orientada a decisiones.
          </p>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {operationalMetrics.map((item) => (
              <article key={item.label} className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-[0_18px_55px_rgba(0,0,0,0.2)]">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.bg} ${item.tone}`}>
                  <AppIcon name={item.icon} className="h-4 w-4" />
                </span>
                <p className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{item.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 max-w-2xl overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_24px_80px_rgba(76,68,172,0.16)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#101620]/85 dark:shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Pulso operativo</p>
                <p className="mt-1 text-[10px] text-slate-400">Actividad agregada de los últimos 7 días</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <AppIcon name="arrowUpRight" className="h-3 w-3" /> En línea
              </span>
            </div>
            <div className="relative mt-5 h-40 overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(99,102,241,0.08),transparent)] dark:bg-[linear-gradient(180deg,rgba(99,102,241,0.12),transparent)]">
              <div className="absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.13)_1px,transparent_1px)] [background-size:100%_32px]" />
              <svg viewBox="0 0 620 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="loginArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6d5dfc" stopOpacity="0.28"/><stop offset="1" stopColor="#6d5dfc" stopOpacity="0"/></linearGradient>
                  <linearGradient id="loginLine" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#6d5dfc"/><stop offset="0.55" stopColor="#8b5cf6"/><stop offset="1" stopColor="#22d3ee"/></linearGradient>
                </defs>
                <path d="M0 126 C55 118 62 96 112 102 S175 126 218 89 S282 60 326 76 S391 112 438 61 S528 43 620 18 L620 150 L0 150 Z" fill="url(#loginArea)" />
                <path d="M0 126 C55 118 62 96 112 102 S175 126 218 89 S282 60 326 76 S391 112 438 61 S528 43 620 18" fill="none" stroke="url(#loginLine)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="620" cy="18" r="6" fill="#22d3ee" stroke="white" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[500px]">
          <div className="mb-7 lg:hidden"><BrandMark /></div>
          <div className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#10151f]/90 dark:shadow-[0_30px_100px_rgba(0,0,0,0.48)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <AppIcon name="shield" className="h-3 w-3" /> Acceso protegido
                </span>
                <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.045em] text-slate-950 dark:text-white">Bienvenido de nuevo</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Ingresa con tus credenciales internas para continuar.</p>
              </div>
              <span className="hidden h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(145deg,#6d5dfc,#22d3ee)] text-white shadow-[0_14px_35px_rgba(99,102,241,0.3)] sm:grid">
                <AppIcon name="lock" className="h-5 w-5" />
              </span>
            </div>

            <div className="my-7 h-px bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.35),transparent)]" />
            <LoginForm />

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
                <p className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300"><AppIcon name="shield" className="h-3.5 w-3.5 text-emerald-500"/> Sesión segura</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-400">Acceso restringido por rol.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
                <p className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300"><AppIcon name="activity" className="h-3.5 w-3.5 text-indigo-500"/> Monitoreado</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-400">Actividad auditada.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
