# Admin — cierre PR-01 y PR-02

## Aplicado

- Una sola salida hacia `EDGE_API_URL`.
- Namespace externo único `/api/backoffice/*`.
- Eliminadas cabeceras de identidad fabricadas por la web.
- Permisos explícitos y fail-closed; no se reconstruyen desde el rol.
- Eliminados `src/lib/db`, consultas PostgreSQL e integración interna directa.
- Eliminado sitemap y alias de rutas defectuosos.
- `robots` bloquea todo el panel.
- Middleware con validación estricta de Origin para POST/PUT/PATCH/DELETE.
- CSP, `frame-ancestors 'none'`, `X-Robots-Tag` y `no-store`.
- Propagación de `x-request-id` al Edge Worker.

## Cambios externos requeridos al integrar

1. Eliminar `pg` y `@types/pg` del `package.json` real si aún existen.
2. Ejecutar en CI: `node tools/security-boundary-check.mjs`.
3. Configurar `EDGE_API_URL`, `NEXT_PUBLIC_APP_URL` y `ADMIN_ALLOWED_ORIGINS`.
4. Eliminar del hosting Admin todas las credenciales y URLs directas de microservicios.

## Build hotfix v2

- Restored a fail-closed compatibility `src/features/auth/mapper.ts` so an
  overlay onto an existing checkout cannot retain the removed
  `getBackendRolePermissions` import.
- Added fail-closed compatibility helpers for the legacy shared permissions
  module.
- Added `tools/cleanup-pr1-pr2-stale-files.mjs` to remove files omitted from
  the corrected source tree when applying it over an existing checkout.
