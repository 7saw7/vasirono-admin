# Backoffice Admin - Login por auth-service

Este `src` corrige el login del backoffice para que ya no valide contraseñas directamente contra Supabase desde Vercel.

## Flujo nuevo

```txt
Panel admin /api/auth/login
↓
POST AUTH_SERVICE_URL/api/auth/login con portal=backoffice
↓
auth-service valida credenciales, rol y crea sesión
↓
Panel admin guarda cookie propia con el token de sesión retornado
↓
Las páginas protegidas validan la sesión consultando auth-service /api/auth/me?portal=backoffice
```

## ENVs requeridas en Vercel `vasirono-admin`

Mínimas para login:

```env
AUTH_SERVICE_URL=https://api.vasirono.com
SESSION_COOKIE_NAME=vasirono_bo_session
SESSION_TTL_DAYS=30
NEXT_PUBLIC_APP_URL=https://admin.vasirono.com
```

Opcionales:

```env
AUTH_SERVICE_TIMEOUT_MS=10000
```

El `DATABASE_URL` puede seguir siendo necesario para las páginas del backoffice que consultan datos directamente; pero el login ya no depende de leer `auth_credentials` desde Vercel.

## Usuario admin

El usuario debe existir en `users` + `auth_credentials` y tener un rol compatible con backoffice, por ejemplo:

```txt
admin
super_admin
moderator
analyst
support
```

En tu caso, con:

```txt
correo: sandrowonmer@gmail.com
contraseña: Vasirono1999
rol: admin
```

el login debe entrar siempre que `auth-service` tenga el `DATABASE_URL` correcto.

## Notas importantes

- No uses registro abierto para admins.
- Los usuarios empresa deben crearse por invitación después de verificación.
- El panel admin guarda su propia cookie `vasirono_bo_session`, pero el token fue emitido por `auth-service`.
