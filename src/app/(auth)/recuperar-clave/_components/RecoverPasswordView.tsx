import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export function RecoverPasswordView() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="hidden bg-neutral-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Vasirono
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
              Recuperación de acceso del backoffice interno.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-300">
              Este flujo debe conectarse a un endpoint real de recuperación y a
              una política segura de expiración de tokens antes de habilitarse
              para producción.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-white">Estado actual</p>
            <p className="mt-2 text-sm text-neutral-300">
              La interfaz está disponible, pero el envío real de recuperación
              aún no está implementado en la API de autenticación.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Vasirono
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">
                Recuperar acceso
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Flujo pendiente de integración con el backend de autenticación.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-950">
                    Recuperación no habilitada todavía
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Para no exponer un flujo incompleto en producción, esta
                    vista queda informativa hasta que exista un endpoint real de
                    recuperación de contraseña y validación segura del token.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Recomendación: habilita este flujo solo cuando tengas el
                  endpoint de solicitud, almacenamiento/validación del token y
                  expiración controlada.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={ROUTES.LOGIN}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                  >
                    Volver al login
                  </Link>

                  <Link
                    href={ROUTES.HOME}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
                  >
                    Ir al inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}