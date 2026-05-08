# Vercel troubleshooting

## Duplicate `/import-excel` route

If Vercel reports:

```text
You cannot have two parallel pages that resolve to the same path.
Please check /(protected)/import-excel and /import-excel.
```

Next.js is seeing two `page.tsx` files that both resolve to `/import-excel` after route groups are removed from the URL.

The intended structure is:

```text
app/import-excel/page.tsx
app/import-excel/layout.tsx
```

The legacy conflicting file must not exist in the deployed commit:

```text
app/(protected)/import-excel/page.tsx
```

Run locally before pushing:

```bash
node scripts/check-next-route-conflicts.mjs
```

The `prebuild` script also runs this check before `prisma generate` and `next build`, so a duplicate route fails early with an actionable message.
