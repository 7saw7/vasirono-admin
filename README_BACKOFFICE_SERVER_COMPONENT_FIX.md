# Fix backoffice dashboard server component error

El error de `/dashboard` no era de microservicios. React/Next estaba fallando porque se pasaba una función (`canAccess`) desde un Server Component hacia un Client Component (`BackofficeSidebar`).

Next/React no permite serializar funciones como props hacia componentes `use client`.

## Cambio aplicado

- `app/(backoffice)/layout.tsx` filtra `backofficeNav` en servidor usando `context.hasPermission`.
- `BackofficeShell` recibe `navItems`, que es un array serializable.
- `BackofficeSidebar` recibe `items` y solo usa `usePathname()` para marcar el item activo.

## Archivos modificados

- `src/app/(backoffice)/layout.tsx`
- `src/components/layout/BackofficeShell.tsx`
- `src/components/layout/BackofficeSidebar.tsx`

Después de reemplazar el `src`, redeploy en Vercel y probar `/dashboard`.
