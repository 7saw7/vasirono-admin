# Backoffice Admin — migración fase 1 a microservicios

Este paquete prepara el panel admin para dejar de consultar Supabase directamente en los módulos operativos principales y pasar por microservicios.

## Incluye

- Login ya delegado a `auth-service`.
- Cliente común: `src/lib/microservices/backoffice-client.ts`.
- Dashboard consultando `analytics-service`.
- Empresas consultando `companies-service`.
- Sucursales consultando `branch-service`.
- Claims y verificaciones consultando `verifications-service`.

## Variables necesarias en Vercel

```env
AUTH_SERVICE_URL=https://api.vasirono.com
ANALYTICS_SERVICE_URL=https://api.vasirono.com
COMPANIES_SERVICE_URL=https://api.vasirono.com
BRANCH_SERVICE_URL=https://api.vasirono.com
VERIFICATIONS_SERVICE_URL=https://api.vasirono.com
USERS_SERVICE_URL=https://api.vasirono.com
REVIEWS_SERVICE_URL=https://api.vasirono.com
PROMOTIONS_SERVICE_URL=https://api.vasirono.com
BILLING_SERVICE_URL=https://api.vasirono.com
NOTIFICATIONS_SERVICE_URL=https://api.vasirono.com
SESSION_COOKIE_NAME=vasirono_bo_session
SESSION_TTL_DAYS=30
NEXT_PUBLIC_APP_URL=https://admin.vasirono.com
```

`DATABASE_URL` puede quedar temporalmente para módulos que aún no tengan endpoint equivalente en microservicios, pero los módulos principales de esta fase ya no dependen de Supabase directo.

## Advertencia importante

No todos los módulos del backoffice pueden migrarse al 100% solo desde la web admin. Algunos necesitan endpoints equivalentes en los micros. Esta fase cubre las pantallas que ya tienen base de endpoints:

- Dashboard via analytics-service.
- Claims/verificaciones via verifications-service.
- Empresas via companies-service.
- Sucursales via branch-service.

Para eliminar totalmente `DATABASE_URL` del panel admin faltan endpoints backoffice para:

- Taxonomías completas.
- Configuración.
- Pagos/suscripciones/planes si billing-service no expone toda la forma que usa el panel.
- Promociones avanzadas.
- Reseñas y reportes si reviews-service no expone toda la forma del panel.
- Usuarios si users-service no expone toda la forma del panel.

## Próximo paso recomendado

1. Desplegar esta fase.
2. Verificar que `/dashboard`, `/claims`, `/verificaciones`, `/empresas`, `/sucursales` carguen.
3. Luego crear endpoints faltantes por micro y migrar módulo por módulo.
