# Admin PR-01/PR-02 build hotfix v2

This version fixes the residual imports that can remain when the corrected ZIP
is copied over an existing repository instead of replacing the old `src`
folder.

## Required application procedure

From the repository root, after extracting this ZIP:

```bash
node tools/cleanup-pr1-pr2-stale-files.mjs
npm run build
```

The cleanup removes legacy direct-database code, the direct Notifications
integration, the sitemap, and obsolete route aliases. It does not touch
`package.json`, lockfiles, Next.js configuration, or deployment files.

## Build fix

- `src/features/auth/mapper.ts` no longer imports
  `getBackendRolePermissions`.
- The mapper requires explicit permissions and fails closed when they are
  absent or invalid.
- The legacy shared role helpers compile but always deny access, preventing
  role-derived permissions.
