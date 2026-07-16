import Link from "next/link";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";

export const dynamic = "force-dynamic";

type ForbiddenPageProps = {
  searchParams?: Promise<{ permission?: string }>;
};

export default async function ForbiddenPage({
  searchParams,
}: ForbiddenPageProps) {
  await getBackofficeContext();
  const params = (await searchParams) ?? {};

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-400/10">
          403
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
          No tienes acceso a este módulo
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Tu sesión es válida, pero el rol activo no cuenta con la capacidad requerida.
        </p>
        {params.permission ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
            {params.permission}
          </p>
        ) : null}
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6d5dfc,#4f46e5)] px-4 text-xs font-bold text-white shadow-[0_9px_24px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
