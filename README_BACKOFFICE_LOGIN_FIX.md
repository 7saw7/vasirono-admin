# Backoffice login fix

Este zip corrige el login del panel admin para la BD actual de Vasirono.

## Problema corregido

El login anterior intentaba leer `u.password_hash` desde `public.users`, pero en la BD actual el hash vive en:

```sql
public.auth_credentials.password_hash
```

Por eso, aunque el usuario admin exista, el login podía fallar.

## ENVs mínimos en Vercel

```env
DATABASE_URL=postgresql://...pooler.../postgres?sslmode=require
SESSION_COOKIE_NAME=vasirono_bo_session
SESSION_TTL_DAYS=30
NEXT_PUBLIC_APP_URL=https://backoffice.vasirono.com
```

## ENVs recomendados para operar claims/verificación desde backoffice

```env
NOTIFICATIONS_SERVICE_URL=https://api.vasirono.com
NOTIFICATIONS_INTERNAL_TOKEN=...
BUSINESS_VERIFICATION_OTP_SECRET=...
NEXTAUTH_SECRET=...
PG_POOL_MAX=10
```

## Cuenta admin

El usuario debe existir en:

- `public.users`
- `public.auth_credentials`

y su rol debe ser `admin` para entrar al backoffice.
