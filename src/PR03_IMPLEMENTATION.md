# PR-03 — Web Admin

## Estado

Implementado sobre el código fuente completo recibido.

## Cambios funcionales

- Inicio de sesión administrativo en cuatro fases: credenciales, enrolamiento TOTP, verificación MFA y entrega única de códigos de recuperación.
- Las respuestas al navegador no incluyen `accessToken` ni `refreshToken`; el BFF de Next.js los conserva en cookies `HttpOnly`.
- Cookies separadas:
  - `admin_access_token`
  - `admin_refresh_token`
- Renovación automática de la sesión mediante el BFF `/api/auth/refresh`.
- Coordinación de la rotación de refresh tokens entre pestañas mediante Web Locks y respaldo con `localStorage`, evitando reutilizaciones accidentales.
- Modal reutilizable de step-up para acciones sensibles.
- Panel de sesiones activas en Configuración:
  - listar sesiones;
  - revocar una sesión;
  - cerrar las demás sesiones;
  - cerrar todas las sesiones después de step-up.
- Las llamadas autenticadas al servicio Auth envían explícitamente `portal=backoffice` para que Worker resuelva el contexto correcto.
- Los permisos se consumen explícitamente desde Auth; la web no deriva privilegios a partir del nombre del rol.

## Archivos principales

- `app/(auth)/login/_components/LoginForm.tsx`
- `app/api/auth/login/route.ts`
- `app/api/auth/mfa/*`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/sessions/route.ts`
- `components/auth/AuthSessionHeartbeat.tsx`
- `components/auth/StepUpModal.tsx`
- `app/(backoffice)/configuracion/_components/SecuritySessionsPanel.tsx`
- `lib/auth/auth-service-client.ts`
- `lib/auth/session.ts`
- `features/auth/types.ts`

## Variables de entorno

```env
EDGE_API_URL=https://<dominio-edge>/api
AUTH_SERVICE_TIMEOUT_MS=10000
ADMIN_ACCESS_COOKIE_NAME=admin_access_token
ADMIN_REFRESH_COOKIE_NAME=admin_refresh_token
```

Los nombres de cookie son opcionales; los valores mostrados son los predeterminados. Ningún secreto MFA debe configurarse en Vercel ni exponerse con prefijos públicos.

## Validación realizada

- TypeScript estricto de los archivos modificados mediante declaraciones temporales de dependencias externas: correcto.
- Transpilación sintáctica del árbol TypeScript: correcta.
- Resolución de imports relativos: correcta.

El ZIP recibido contiene solo `src/`, por lo que no fue posible ejecutar el build real de Next.js sin el `package.json`, lockfile y dependencias del repositorio completo.
