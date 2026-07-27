# PR-04 — Web Admin

Cambios funcionales aplicados al módulo de usuarios:

- Contratos de mutación con `expectedVersion`, `reasonCode`, `reason`, `supportReference` e `idempotencyKey`.
- Envío de `targetRoleId` en lugar del contrato ambiguo anterior.
- Capacidades de interfaz derivadas únicamente de permisos explícitos.
- Modal de step-up MFA y reintento de la misma operación con la misma clave de idempotencia.
- Tratamiento de `409 Conflict` mediante recarga del registro.
- Visualización de la versión actual y motivo obligatorio para operaciones privilegiadas.

La interfaz no sustituye las políticas de seguridad de `users-service`; solo refleja las capacidades entregadas por Auth.
